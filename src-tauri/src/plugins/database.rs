use anyhow::anyhow;
use bonsaidb::core::connection::{AsyncCollection, AsyncConnection, AsyncStorageConnection};
use bonsaidb::core::document::OwnedDocument;
use bonsaidb::core::schema::{Collection, SerializedCollection};
use bonsaidb::core::transaction::{Operation, Transaction};
use bonsaidb::local::config::{Builder as BonsaiBuilder, StorageConfiguration};
use bonsaidb::local::AsyncDatabase;
use bonsaidb::local::AsyncStorage;
use lofty::{Accessor, AudioFile, ItemKey, TaggedFileExt};
use log::{error, info, warn};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::path::PathBuf;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, Runtime, State};
use ts_rs::TS;
use uuid::Uuid;

use crate::libs::error::{AnyResult, MuseeksError};
use crate::libs::events::IPCEvent;
use crate::libs::utils::{app_data_dir, scan_dirs, TimeLogger};

const INSERTION_BATCH: usize = 200;

pub const SUPPORTED_TRACKS_EXTENSIONS: [&str; 12] = [
    "mp3", "mp4", "aac", "m4a", "3gp", "wav", /* mp3 / mp4 */
    "ogg", "ogv", "ogm", "opus", /* Opus */
    "flac", /* Flac */
    "webm", /* Web media */
];

// pub const SUPPORTED_PLAYLISTS_EXTENSIONS: [&str; 1] = [".m3u"];

/** ----------------------------------------------------------------------------
 * Databases
 * exposes databases for tracks and playlists
 * TODO:
 *   - Export all needed structs to a single file: ts-rs#59
 * -------------------------------------------------------------------------- */
pub struct DB {
    pub tracks: AsyncDatabase,
    pub playlists: AsyncDatabase,
}

impl DB {
    fn tracks_collection(&self) -> AsyncCollection<'_, AsyncDatabase, Track> {
        self.tracks.collection::<Track>()
    }

    fn playlists_collection(&self) -> AsyncCollection<'_, AsyncDatabase, Playlist> {
        self.playlists.collection::<Playlist>()
    }

    /**
     * Get all the tracks (and their content) from the database
     */
    pub async fn get_all_tracks(&self) -> AnyResult<Vec<Track>> {
        let timer = TimeLogger::new("Retrieved and decoded tracks".into());
        let docs = self.tracks_collection().all().await?;
        let tracks = self.decode_docs::<Track>(docs);
        timer.complete();
        tracks
    }

    /**
     * Get tracks (and their content) given a set of document IDs
     */
    pub async fn get_tracks(&self, track_ids: Vec<String>) -> AnyResult<Vec<Track>> {
        let docs = self.tracks_collection().get_multiple(&track_ids).await?;

        match self.decode_docs::<Track>(docs) {
            Ok(mut tracks) => {
                // document may not ordered the way we want, so let's ensure they map to track_ids
                tracks.sort_by_key(|track| track_ids.iter().position(|id| id == &track._id));
                Ok(tracks)
            }
            Err(err) => Err(err),
        }
    }

    /** Delete multiple tracks by ID */
    pub async fn remove_tracks(&self, ids: Vec<String>) -> AnyResult<()> {
        let tracks = self.tracks_collection().get_multiple(&ids).await?;

        let mut tx = Transaction::new();
        for track in tracks {
            tx.push(Operation::delete(Track::collection_name(), track.header));
        }
        tx.apply_async(&self.tracks).await?;

        Ok(())
    }

    /**
     * Insert a new track in the DB, will fail in case there is a duplicate unique
     * key (like track.path)
     *
     * Doc: https://github.com/khonsulabs/bonsaidb/blob/main/examples/basic-local/examples/basic-local-multidb.rs
     */
    pub async fn insert_track(&self, tracks: &Vec<Track>) -> AnyResult<()> {
        // BonsaiDB does not work well (as of today) with a lot of very small
        // insertions, so let's insert tracks by batch instead then
        // TODO: if a batch fails (because for example a duplicate path), the whole
        // transaction should not
        let batches: Vec<Vec<Track>> = tracks.chunks(INSERTION_BATCH).map(|x| x.to_vec()).collect();

        info!("Splitting tracks in {} batche(s)", batches.len());

        for batch in batches {
            let mut tx = Transaction::new();

            for track in batch {
                tx.push(Operation::push_serialized::<Track>(&track)?);
            }

            // Let's goooo
            let result = tx.apply_async(&self.tracks).await;

            match result {
                Ok(_) => (),
                // TODO:
                // Err(bonsaidb::core::Error::DocumentConflict(_err, _)) => {
                //     info!("Track already in library: '{:?}'", &track.path);
                // }
                Err(err) => {
                    error!("Failed to insert tracks: {:?}", err);
                }
            }
        }

        Ok(())
    }

    /** Get all the playlists (and their content) from the database */
    pub async fn get_all_playlists(&self) -> AnyResult<Vec<Playlist>> {
        let timer = TimeLogger::new("Retrieved and decoded playlists".into());
        let docs = self.playlists_collection().all().await?;
        let playlists = self.decode_docs::<Playlist>(docs);
        timer.complete();
        playlists
    }

    /** Get a single playlist by ID */
    pub async fn get_playlist(&self, playlist_id: String) -> AnyResult<Option<Playlist>> {
        let maybe_doc = self.playlists_collection().get(&playlist_id).await?;

        match maybe_doc {
            Some(doc) => Ok(Some(self.decode_doc::<Playlist>(doc)?)),
            None => Ok(None),
        }
    }

    /** Create a playlist given a name and a set of track IDs */
    pub async fn create_playlist(&self, name: String, tracks: Vec<String>) -> AnyResult<Playlist> {
        let playlist = Playlist {
            _id: uuid::Uuid::new_v4().to_string(),
            name,
            tracks,
            import_path: None,
        };

        self.playlists_collection()
            .insert(&playlist._id, &playlist)
            .await?;

        Ok(playlist)
    }

    /** Set the tracks of a playlist given its ID and tracks IDs */
    pub async fn set_playlist_tracks(
        &self,
        id: String,
        tracks: Vec<String>,
    ) -> AnyResult<Playlist> {
        if let Some(document) = self.playlists_collection().get(&id).await? {
            let mut playlist = self.decode_doc::<Playlist>(document)?;

            // Insert new tracks + make sure we remove duplicates (the UI does
            // not play well with those).
            playlist.tracks = tracks
                .into_iter()
                .collect::<HashSet<_>>()
                .into_iter()
                .collect::<Vec<_>>();

            match playlist.overwrite_into_async(&id, &self.playlists).await {
                Ok(doc) => Ok(doc.contents),
                Err(_) => Err(MuseeksError::Library {
                    message: "Failed to set playlist tracks".into(),
                }),
            }
        } else {
            Err(MuseeksError::PlaylistNotFound)
        }
    }

    /** Update a playlist name by ID */
    pub async fn rename_playlist(&self, id: String, name: String) -> AnyResult<Playlist> {
        if let Some(document) = self.playlists_collection().get(&id).await? {
            let mut playlist = self.decode_doc::<Playlist>(document)?;
            playlist.name = name;

            match playlist.overwrite_into_async(&id, &self.playlists).await {
                Ok(doc) => Ok(doc.contents),
                Err(_) => Err(MuseeksError::Library {
                    message: "Failed to rename playlist".into(),
                }),
            }
        } else {
            Err(MuseeksError::PlaylistNotFound)
        }
    }

    /** Delete a playlist by ID */
    pub async fn delete_playlist(&self, id: String) -> AnyResult<()> {
        if let Some(document) = self.playlists_collection().get(&id).await? {
            Ok(self.playlists_collection().delete(&document).await?)
        } else {
            Err(MuseeksError::PlaylistNotFound)
        }
    }

    /**
     * Decode the content for a given set of document (track, playlist, etc)
     */
    fn decode_docs<T: SerializedCollection>(
        &self,
        docs: Vec<OwnedDocument>,
    ) -> AnyResult<Vec<<T as SerializedCollection>::Contents>> {
        let mut entries = vec![];

        for doc in docs {
            let deserialized = T::document_contents(&doc)?;
            entries.push(deserialized);
        }

        Ok(entries)
    }

    fn decode_doc<T: SerializedCollection>(
        &self,
        doc: OwnedDocument,
    ) -> AnyResult<<T as SerializedCollection>::Contents> {
        Ok(T::document_contents(&doc)?)
    }
}

/** ----------------------------------------------------------------------------
 * Track
 * represent a single track, id and path should be unique
 * -------------------------------------------------------------------------- */
#[derive(Debug, Clone, Serialize, Deserialize, Collection, TS)]
#[collection(name="tracks", primary_key = String)]
#[ts(export, export_to = "../src/generated/typings/Track.ts")]
pub struct Track {
    #[natural_id]
    pub _id: String,
    pub title: String,
    pub album: String,
    pub artists: Vec<String>,
    pub genres: Vec<String>,
    pub year: Option<u32>,
    pub duration: u32,
    pub track: NumberOf,
    pub disk: NumberOf,
    pub path: PathBuf,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../src/generated/typings/NumberOf.ts")]
pub struct NumberOf {
    pub no: Option<u32>,
    pub of: Option<u32>,
}

/** ----------------------------------------------------------------------------
 * Playlist
 * represent a playlist, that has a name and a list of tracks
 * -------------------------------------------------------------------------- */

#[derive(Debug, Clone, Serialize, Deserialize, Collection, TS)]
#[collection(name = "playlists", primary_key = String)]
#[ts(export, export_to = "../src/generated/typings/Playlist.ts")]
pub struct Playlist {
    #[natural_id]
    pub _id: String,
    pub name: String,
    pub tracks: Vec<String>, // vector of IDs
    pub import_path: Option<PathBuf>,
}

/**
 * Scan progress
 */
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../src/generated/typings/Progress.ts")]
pub struct Progress {
    current: usize,
    total: usize,
}

/** ----------------------------------------------------------------------------
 * Commands
 * -------------------------------------------------------------------------- */

/**
 * Popup a directory picker dialog, scan the selected folders, extract all
 * ID3 tags from it, and update the DB accordingly.
 */
#[tauri::command]
async fn import_tracks_to_library<R: Runtime>(
    window: tauri::Window<R>,
    db: State<'_, DB>,
    import_paths: Vec<PathBuf>,
) -> AnyResult<Vec<Track>> {
    let webview_window = window.get_webview_window("main").unwrap();

    info!("Importing paths to library:");
    for path in &import_paths {
        info!("  - {:?}", path)
    }

    let paths = scan_dirs(&import_paths, &SUPPORTED_TRACKS_EXTENSIONS);
    let task_count = paths.len();

    let progress = Arc::new(AtomicUsize::new(1));
    let total = Arc::new(AtomicUsize::new(paths.len()));

    webview_window
        .emit(
            IPCEvent::LibraryScanProgress.as_ref(),
            Progress {
                current: 0,
                total: paths.len(),
            },
        )
        .unwrap();

    // Let's get all tracks ID3
    info!("Importing ID3 tags from {} files", task_count);
    let scan_logger = TimeLogger::new("Scanned all id3 tags".into());

    let tracks = &paths
        .par_iter()
        .map(|path| -> Option<Track> {
            // let counter = processed.clone();
            let p_current = progress.clone().fetch_add(1, Ordering::SeqCst);
            let p_total = total.clone().load(Ordering::SeqCst);

            if p_current % 200 == 0 || p_current == p_total {
                info!("Processing tracks {:?}/{:?}", p_current, total);
                webview_window
                    .emit(
                        IPCEvent::LibraryScanProgress.as_ref(),
                        Progress {
                            current: p_current,
                            total: p_total,
                        },
                    )
                    .unwrap();
            }

            match lofty::read_from_path(&path) {
                Ok(tagged_file) => {
                    let tag = tagged_file.primary_tag()?;

                    // TODO: make sure we don't save tracks that are already in DB
                    // IMPROVE ME: Is there a more idiomatic way of doing the following?
                    let mut artists: Vec<String> = tag
                        .get_strings(&ItemKey::TrackArtist)
                        .map(ToString::to_string)
                        .collect();

                    if artists.is_empty() {
                        artists = tag
                            .get_strings(&ItemKey::AlbumArtist)
                            .map(ToString::to_string)
                            .collect();
                    }

                    if artists.is_empty() {
                        artists = vec!["Unknown Artist".into()];
                    }

                    Some(Track {
                        _id: Uuid::new_v3(&Uuid::NAMESPACE_OID, path.to_string_lossy().as_bytes())
                            .to_string(),
                        title: tag
                            .get_string(&ItemKey::TrackTitle)
                            .unwrap_or("Unknown")
                            .to_string(),
                        album: tag
                            .get_string(&ItemKey::AlbumTitle)
                            .unwrap_or("Unknown")
                            .to_string(),
                        artists,
                        genres: tag
                            .get_strings(&ItemKey::Genre)
                            .map(ToString::to_string)
                            .collect(),
                        year: tag.year(),
                        duration: u32::try_from(tagged_file.properties().duration().as_secs())
                            .unwrap_or(0),
                        track: NumberOf {
                            no: tag.track(),
                            of: tag.track_total(),
                        },
                        disk: NumberOf {
                            no: tag.disk(),
                            of: tag.disk_total(),
                        },
                        path: path.to_owned(),
                    })
                }
                Err(err) => {
                    warn!("Failed to get ID3 tags: \"{}\". File {:?}", err, path);
                    None
                }
            }
        })
        .flatten()
        .collect::<Vec<Track>>();

    info!("{} tracks successfully scanned", tracks.len());
    info!("{} tracks failed to be scanned", paths.len() - tracks.len());
    scan_logger.complete();

    let db_insert_logger: TimeLogger = TimeLogger::new("Inserted tracks".into());

    // Insert all tracks in the DB
    let result = db.insert_track(tracks).await;

    if result.is_err() {
        warn!("Something went wrong when inserting tracks");
    }

    db_insert_logger.complete();

    let tracks = db.get_all_tracks().await.unwrap();

    Ok(tracks)
}

#[tauri::command]
async fn get_all_tracks(db: State<'_, DB>) -> AnyResult<Vec<Track>> {
    db.get_all_tracks().await
}

#[tauri::command]
async fn get_tracks(db: State<'_, DB>, ids: Vec<String>) -> AnyResult<Vec<Track>> {
    db.get_tracks(ids).await
}
#[tauri::command]
async fn remove_tracks(db: State<'_, DB>, ids: Vec<String>) -> AnyResult<()> {
    db.remove_tracks(ids).await
}

#[tauri::command]
async fn get_all_playlists(db: State<'_, DB>) -> AnyResult<Vec<Playlist>> {
    db.get_all_playlists().await
}

#[tauri::command]
async fn get_playlist(db: State<'_, DB>, id: String) -> AnyResult<Playlist> {
    match db.get_playlist(id).await {
        Ok(Some(playlist)) => Ok(playlist),
        Ok(None) => Err(MuseeksError::PlaylistNotFound),
        Err(err) => Err(err),
    }
}

#[tauri::command]
async fn create_playlist(
    db: State<'_, DB>,
    name: String,
    tracks: Vec<String>,
) -> AnyResult<Playlist> {
    db.create_playlist(name, tracks).await
}

#[tauri::command]
async fn rename_playlist(db: State<'_, DB>, id: String, name: String) -> AnyResult<Playlist> {
    db.rename_playlist(id, name).await
}

#[tauri::command]
async fn set_playlist_tracks(
    db: State<'_, DB>,
    id: String,
    tracks: Vec<String>,
) -> AnyResult<Playlist> {
    db.set_playlist_tracks(id, tracks).await
}

#[tauri::command]
async fn delete_playlist(db: State<'_, DB>, id: String) -> AnyResult<()> {
    db.delete_playlist(id).await
}

#[tauri::command]
async fn reset(db: State<'_, DB>) -> AnyResult<()> {
    info!("Resetting DB...");
    let timer = TimeLogger::new("Reset DB".into());

    let tracks = db.tracks_collection().all().await?;
    let playlists = db.playlists_collection().all().await?;

    // We create a transaction to delete tracks much faster
    let mut tx = Transaction::new();

    for track in tracks {
        tx.push(Operation::delete(Track::collection_name(), track.header));
    }

    tx.apply_async(&db.tracks).await?;

    // Now let's delete playlists
    tx = Transaction::new();

    for playlist in playlists {
        tx.push(Operation::delete(
            Playlist::collection_name(),
            playlist.header,
        ));
    }

    tx.apply_async(&db.playlists).await?;

    timer.complete();

    Ok(())
}

/**
 * Database setup
 * Doc: https://github.com/khonsulabs/bonsaidb/blob/main/examples/basic-local/examples/basic-local-multidb.rs
 */
pub async fn setup() -> AnyResult<DB> {
    let app_data_path = app_data_dir().ok_or_else(|| anyhow!("no app data directory"))?;
    let storage_configuration = StorageConfiguration::new(app_data_path.join("main.bonsaidb"))
        .with_schema::<Track>()?
        .with_schema::<Playlist>()?;

    let storage = AsyncStorage::open(storage_configuration).await?;

    let tracks = storage.create_database::<Track>("tracks", true).await?;
    let playlists = storage
        .create_database::<Playlist>("playlists", true)
        .await?;

    Ok(DB { tracks, playlists })
}

/**
 * Database plugin, exposing commands and state
 */
pub fn init<R: Runtime>(db: DB) -> TauriPlugin<R> {
    Builder::<R>::new("database")
        .invoke_handler(tauri::generate_handler![
            get_all_tracks,
            get_tracks,
            remove_tracks,
            get_tracks,
            get_all_playlists,
            get_playlist,
            get_playlist,
            create_playlist,
            rename_playlist,
            set_playlist_tracks,
            delete_playlist,
            reset,
            import_tracks_to_library,
        ])
        .setup(|app_handle, _api| {
            app_handle.manage(db);
            Ok(())
        })
        .build()
}
