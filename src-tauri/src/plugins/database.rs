use bonsaidb::core::connection::{AsyncCollection, AsyncConnection, AsyncStorageConnection};
use bonsaidb::core::document::OwnedDocument;
use bonsaidb::core::schema::{Collection, SerializedCollection};
use bonsaidb::core::transaction::{Operation, Transaction};
use bonsaidb::local::config::{Builder as BonsaiBuilder, StorageConfiguration};
use bonsaidb::local::AsyncDatabase;
use bonsaidb::local::AsyncStorage;
use itertools::Itertools;
use log::{error, info, warn};
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::path::PathBuf;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::Emitter;
use tauri::{Manager, Runtime, State};
use tauri_plugin_dialog::{DialogExt, FilePath};
use ts_rs::TS;

use crate::libs::error::{AnyResult, MuseeksError};
use crate::libs::events::IPCEvent;
use crate::libs::track::{get_track_from_file, get_track_id_for_path, Track};
use crate::libs::utils::{scan_dirs, TimeLogger};

use super::config::get_storage_dir;

const INSERTION_BATCH: usize = 200;

// KEEP THAT IN SYNC with Tauri's file associations in tauri.conf.json
pub const SUPPORTED_TRACKS_EXTENSIONS: [&str; 9] = [
    "mp3", "aac", "m4a", "3gp", "wav", /* mp3 / mp4 */
    "ogg", "opus", /* Opus */
    "flac", /* Flac */
    "weba", /* Web media */
];

pub const SUPPORTED_PLAYLISTS_EXTENSIONS: [&str; 1] = ["m3u"];

/** ----------------------------------------------------------------------------
 * Databases
 * exposes databases for tracks and playlists
 *
 * TODO: probably split between tracks and playlists, this file is getting out of hand
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
        let tracks = self.decode_docs::<Track>(&docs);
        timer.complete();
        tracks
    }

    /**
     * Get tracks (and their content) given a set of document IDs
     */
    pub async fn get_tracks(&self, track_ids: &Vec<String>) -> AnyResult<Vec<Track>> {
        let docs = self.tracks_collection().get_multiple(track_ids).await?;

        match self.decode_docs::<Track>(&docs) {
            Ok(mut tracks) => {
                // document may not ordered the way we want, so let's ensure they map to track_ids
                let track_id_positions: HashMap<&String, usize> = track_ids
                    .iter()
                    .enumerate()
                    .map(|(i, id)| (id, i))
                    .collect();
                tracks.sort_by_key(|track| track_id_positions.get(&track._id));
                Ok(tracks)
            }
            Err(err) => Err(err),
        }
    }

    /**
     * Get tracks (and their content) given a set of document IDs
     */
    pub async fn update_track(&self, track: Track) -> AnyResult<Track> {
        let track_id = &track._id.clone();

        match track.overwrite_into_async(&track_id, &self.tracks).await {
            Ok(doc) => Ok(doc.contents),
            Err(_) => Err(MuseeksError::Library {
                message: "Failed to update track".into(),
            }),
        }
    }

    /** Delete multiple tracks by ID */
    pub async fn remove_tracks(&self, ids: &Vec<String>) -> AnyResult<()> {
        let tracks = self.tracks_collection().get_multiple(ids).await?;

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
    pub async fn insert_tracks(&self, tracks: &Vec<Track>) -> AnyResult<()> {
        // BonsaiDB does not work well (as of today) with a lot of very small
        // insertions, so let's insert tracks by batch instead.
        // If a batch fails (because for example a duplicate path), the whole transaction
        // will fail. This should not happen except something is really wrong (hash collision,
        // no disk space, etc).
        let batches: Vec<Vec<Track>> = tracks.chunks(INSERTION_BATCH).map(|x| x.to_vec()).collect();

        for batch in batches {
            let mut tx = Transaction::new();

            for track in batch {
                tx.push(Operation::push_serialized::<Track>(&track)?);
            }

            // Let's goooo
            let result = tx.apply_async(&self.tracks).await;

            match result {
                Ok(_) => (),
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
        let mut playlists = self.decode_docs::<Playlist>(&docs)?;

        // Ensure the playlists are sorted alphabetically (case-insensitive) for better UX
        playlists.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

        timer.complete();
        Ok(playlists)
    }

    /** Get a single playlist by ID */
    pub async fn get_playlist(&self, playlist_id: &String) -> AnyResult<Option<Playlist>> {
        let maybe_doc = self.playlists_collection().get(&playlist_id).await?;

        match maybe_doc {
            Some(doc) => Ok(Some(self.decode_doc::<Playlist>(&doc)?)),
            None => Ok(None),
        }
    }

    /** Create a playlist given a name and a set of track IDs */
    pub async fn create_playlist(
        &self,
        name: String,
        tracks_ids: Vec<String>,
        import_path: Option<PathBuf>,
    ) -> AnyResult<Playlist> {
        let playlist = Playlist {
            _id: uuid::Uuid::new_v4().to_string(),
            name,
            tracks: tracks_ids,
            import_path,
        };

        self.playlists_collection()
            .insert(&playlist._id, &playlist)
            .await?;

        Ok(playlist)
    }

    /** Set the tracks of a playlist given its ID and tracks IDs */
    pub async fn set_playlist_tracks(
        &self,
        id: &String,
        tracks: Vec<String>,
    ) -> AnyResult<Playlist> {
        if let Some(document) = self.playlists_collection().get(id).await? {
            let mut playlist = self.decode_doc::<Playlist>(&document)?;

            // Make sure we remove duplicates (the UI does not play well with those yet).
            playlist.tracks = tracks.into_iter().unique().collect_vec();

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
    pub async fn rename_playlist(&self, id: &String, name: String) -> AnyResult<Playlist> {
        if let Some(document) = self.playlists_collection().get(&id).await? {
            let mut playlist = self.decode_doc::<Playlist>(&document)?;
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
    pub async fn delete_playlist(&self, id: &String) -> AnyResult<()> {
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
        docs: &Vec<OwnedDocument>,
    ) -> AnyResult<Vec<<T as SerializedCollection>::Contents>> {
        let mut entries = vec![];

        for doc in docs {
            let deserialized = T::document_contents(doc)?;
            entries.push(deserialized);
        }

        Ok(entries)
    }

    fn decode_doc<T: SerializedCollection>(
        &self,
        doc: &OwnedDocument,
    ) -> AnyResult<<T as SerializedCollection>::Contents> {
        Ok(T::document_contents(doc)?)
    }
}

/** ----------------------------------------------------------------------------
 * Playlist
 * represent a playlist, that has a name and a list of tracks
 * -------------------------------------------------------------------------- */

#[derive(Debug, Clone, Serialize, Deserialize, Collection, TS)]
#[collection(name = "playlists", primary_key = String)]
#[ts(export, export_to = "../../src/generated/typings/index.ts")]
pub struct Playlist {
    #[natural_id]
    pub _id: String,
    pub name: String,
    pub tracks: Vec<String>,          // vector of IDs
    pub import_path: Option<PathBuf>, // the path of the file on disk (not set for playlists created in app)
}

/**
 * Scan progress
 */
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/generated/typings/index.ts")]
pub struct ScanProgress {
    current: usize,
    total: usize,
}

#[derive(Default, Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/generated/typings/index.ts")]
pub struct ScanResult {
    track_count: usize,
    track_failures: usize,
    playlist_count: usize,
    playlist_failures: usize,
}

/** ----------------------------------------------------------------------------
 * Commands
 * -------------------------------------------------------------------------- */

/**
 * Scan the selected folders, extract all ID3 tags from it, and update the DB
 * accordingly.
 */
#[tauri::command]
async fn import_tracks_to_library<R: Runtime>(
    window: tauri::Window<R>,
    db: State<'_, DB>,
    import_paths: Vec<PathBuf>,
) -> AnyResult<ScanResult> {
    let webview_window = window.get_webview_window("main").unwrap();

    info!("Importing paths to library:");
    for path in &import_paths {
        info!("  - {:?}", path)
    }

    let mut scan_result = ScanResult::default();

    // Scan all directories for valid files to be scanned and imported
    let mut track_paths = scan_dirs(&import_paths, &SUPPORTED_TRACKS_EXTENSIONS);
    let scanned_paths_count = track_paths.len();

    // Remove files that are already in the DB (speedup scan + prevent duplicate errors)
    let existing_paths = db
        .get_all_tracks()
        .await?
        .iter()
        .map(move |track| track.path.to_owned())
        .collect::<HashSet<_>>();

    track_paths.retain(|path| !existing_paths.contains(path));

    info!("Found {} files to import", track_paths.len());
    info!(
        "{} tracks already imported (they will be skipped)",
        scanned_paths_count - track_paths.len()
    );

    // Setup progress tracking for the UI
    let progress = Arc::new(AtomicUsize::new(1));
    let total = Arc::new(AtomicUsize::new(track_paths.len()));

    webview_window
        .emit(
            IPCEvent::LibraryScanProgress.as_ref(),
            ScanProgress {
                current: 0,
                total: track_paths.len(),
            },
        )
        .unwrap();

    // Let's get all tracks ID3
    info!("Importing ID3 tags from {} files", track_paths.len());
    let scan_logger = TimeLogger::new("Scanned all id3 tags".into());

    let tracks = &track_paths
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
                        ScanProgress {
                            current: p_current,
                            total: p_total,
                        },
                    )
                    .unwrap();
            }

            get_track_from_file(path)
        })
        .flatten()
        .collect::<Vec<Track>>();

    let track_failures = track_paths.len() - tracks.len();
    scan_result.track_count = tracks.len();
    scan_result.track_failures = track_failures;
    info!("{} tracks successfully scanned", tracks.len());
    info!("{} tracks failed to be scanned", track_failures);

    scan_logger.complete();

    // Insert all tracks in the DB, we'are kind of assuming it cannot fail (regarding scan progress information), but
    // it technically could.
    let db_insert_logger: TimeLogger = TimeLogger::new("Inserted tracks".into());
    let result = db.insert_tracks(tracks).await;

    if result.is_err() {
        warn!("Something went wrong when inserting tracks");
    }

    db_insert_logger.complete();

    // Now that all tracks are inserted, let's scan for playlists, and import them
    let mut playlist_paths = scan_dirs(&import_paths, &SUPPORTED_PLAYLISTS_EXTENSIONS);

    // Ignore playlists that are already in the DB (speedup scan + prevent duplicate errors)
    let existing_playlists_paths = db
        .get_all_playlists()
        .await?
        .iter()
        .map(move |playlist| playlist.import_path.to_owned())
        .flatten()
        .collect::<HashSet<_>>();

    playlist_paths.retain(|path| !existing_playlists_paths.contains(path));

    info!("Found {} playlist(s) to import", playlist_paths.len());

    // Start scanning the content of the playlists and adding them to the DB
    for playlist_path in playlist_paths {
        match {
            let mut reader = m3u::Reader::open(&playlist_path).unwrap();
            let playlist_dir_path = playlist_path.parent().unwrap();

            let track_paths: Vec<PathBuf> = reader
                .entries()
                .filter_map(|entry| {
                    let Ok(entry) = entry else {
                        return None;
                    };

                    match entry {
                        m3u::Entry::Path(path) => Some(playlist_dir_path.join(path)),
                        _ => return None, // We don't support (yet?) URLs in playlists
                    }
                })
                .collect();

            // Ok, this is sketchy. To avoid having to create a TrackByPath DB View,
            // let's guess the ID of the track with UUID::v3
            let track_ids = track_paths
                .iter()
                .flat_map(|path| get_track_id_for_path(path))
                .collect::<Vec<String>>();

            let playlist_name = playlist_path
                .file_stem()
                .unwrap()
                .to_str()
                .unwrap_or("unknown playlist")
                .to_owned();

            let tracks = db.get_tracks(&track_ids).await?;

            if tracks.len() != track_ids.len() {
                warn!(
                    "Playlist track mismatch ({} from playlist, {} from library)",
                    track_paths.len(),
                    tracks.len()
                );
            }

            info!(
                r#"Creating playlist "{}" ({} tracks)"#,
                &playlist_name,
                &track_ids.len()
            );

            db.create_playlist(playlist_name, track_ids, Some(playlist_path))
                .await?;
            Ok::<(), MuseeksError>(())
        } {
            Ok(_) => {
                scan_result.playlist_count += 1;
            }
            Err(err) => {
                warn!("Failed to import playlist: {}", err);
                scan_result.playlist_failures += 1;
            }
        }
    }

    // All good :]
    Ok(scan_result)
}

#[tauri::command]
async fn get_all_tracks(db: State<'_, DB>) -> AnyResult<Vec<Track>> {
    db.get_all_tracks().await
}

#[tauri::command]
async fn get_tracks(db: State<'_, DB>, ids: Vec<String>) -> AnyResult<Vec<Track>> {
    db.get_tracks(&ids).await
}

#[tauri::command]
async fn update_track(db: State<'_, DB>, track: Track) -> AnyResult<Track> {
    db.update_track(track).await
}

#[tauri::command]
async fn remove_tracks(db: State<'_, DB>, ids: Vec<String>) -> AnyResult<()> {
    db.remove_tracks(&ids).await
}

#[tauri::command]
async fn get_all_playlists(db: State<'_, DB>) -> AnyResult<Vec<Playlist>> {
    db.get_all_playlists().await
}

#[tauri::command]
async fn get_playlist(db: State<'_, DB>, id: String) -> AnyResult<Playlist> {
    match db.get_playlist(&id).await {
        Ok(Some(playlist)) => Ok(playlist),
        Ok(None) => Err(MuseeksError::PlaylistNotFound),
        Err(err) => Err(err),
    }
}

#[tauri::command]
async fn create_playlist(
    db: State<'_, DB>,
    name: String,
    ids: Vec<String>,
    import_path: Option<PathBuf>,
) -> AnyResult<Playlist> {
    db.create_playlist(name, ids, import_path).await
}

#[tauri::command]
async fn rename_playlist(db: State<'_, DB>, id: String, name: String) -> AnyResult<Playlist> {
    db.rename_playlist(&id, name).await
}

#[tauri::command]
async fn set_playlist_tracks(
    db: State<'_, DB>,
    id: String,
    tracks: Vec<String>,
) -> AnyResult<Playlist> {
    db.set_playlist_tracks(&id, tracks).await
}

#[tauri::command]
async fn export_playlist<R: Runtime>(
    window: tauri::Window<R>,
    db: State<'_, DB>,
    id: String,
) -> AnyResult<()> {
    let Some(playlist) = db.get_playlist(&id).await? else {
        return Ok(());
    };

    let tracks = db.get_tracks(&playlist.tracks).await?;

    window
        .dialog()
        .file()
        .add_filter("playlist", &SUPPORTED_PLAYLISTS_EXTENSIONS)
        .save_file(move |maybe_playlist_path| {
            let playlist_path = match maybe_playlist_path {
                // We don't support FilePath::Url
                Some(FilePath::Path(path)) => path,
                _ => return,
            };

            let playlist_dir_path = playlist_path.parent().unwrap();

            let playlist = tracks
                .iter()
                .map(|track| {
                    let relative_path =
                        pathdiff::diff_paths(&track.path, &playlist_dir_path).unwrap();
                    return m3u::path_entry(relative_path);
                })
                .collect::<Vec<m3u::Entry>>();

            let mut file = std::fs::File::create(playlist_path).unwrap();
            let mut writer = m3u::Writer::new(&mut file);
            for entry in &playlist {
                writer.write_entry(entry).unwrap();
            }
        });

    Ok(())
}

#[tauri::command]
async fn delete_playlist(db: State<'_, DB>, id: String) -> AnyResult<()> {
    db.delete_playlist(&id).await
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
async fn setup() -> AnyResult<DB> {
    let storage_path = get_storage_dir();
    let storage_configuration = StorageConfiguration::new(storage_path.join("main.bonsaidb"))
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
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("database")
        .invoke_handler(tauri::generate_handler![
            get_all_tracks,
            get_tracks,
            remove_tracks,
            get_tracks,
            update_track,
            get_all_playlists,
            get_playlist,
            get_playlist,
            create_playlist,
            rename_playlist,
            set_playlist_tracks,
            export_playlist,
            delete_playlist,
            reset,
            import_tracks_to_library,
        ])
        .setup(move |app_handle, _api| {
            let app_handle = app_handle.clone();
            tauri::async_runtime::spawn(async move {
                let db = match setup().await {
                    Ok(db) => db,
                    Err(err) => {
                        error!("Failed to setup database: {:?}", err);
                        return;
                    }
                };
                app_handle.manage(db);
            });
            Ok(())
        })
        .build()
}
