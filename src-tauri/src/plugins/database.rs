use base64::prelude::*;
use bonsaidb::core::connection::{AsyncConnection, AsyncStorageConnection};
use bonsaidb::core::document::OwnedDocument;
use bonsaidb::core::schema::{Collection, SerializedCollection};
use bonsaidb::core::transaction::{Operation, Transaction};
use bonsaidb::local::config::{Builder as BonsaiBuilder, StorageConfiguration};
use bonsaidb::local::AsyncDatabase;
use bonsaidb::local::AsyncStorage;
use lofty::{Accessor, AudioFile, MimeType, TaggedFileExt};
use log::{debug, error, info, warn};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, Runtime, State};
use ts_rs::TS;
use uuid::Uuid;

use crate::constants;
use crate::libs::error::{AnyResult, MuseeksError};
use crate::libs::utils::{get_app_storage_dir, scan_dirs, TimeLogger};

const INSERTION_BATCH: usize = 200;

/** ----------------------------------------------------------------------------
 * Databases
 * exposes databases for tracks and playlists
 * TODO:
 *   - Export all needed structs to a single file: ts-rs#59
 * -------------------------------------------------------------------------- */
#[derive(Debug)]
pub struct DB {
    pub tracks: AsyncDatabase,
    pub playlists: AsyncDatabase,
}

impl DB {
    /**
     * Get all the tracks (and their content) from the database
     */
    pub async fn get_all_tracks(&self) -> AnyResult<Vec<Track>> {
        let timer = TimeLogger::new("Retrieved all tracks from DB".into());

        let collection = self.tracks.collection::<Track>();
        let docs = collection.all().await?;

        timer.complete();

        let decode_timer = TimeLogger::new("Decoded all tracks content".into());
        let tracks = self.decode_docs::<Track>(docs);
        decode_timer.complete();

        tracks
    }

    /**
     * Get tracks (and their content) given a set of document IDs
     */
    pub async fn get_tracks(&self, track_ids: Vec<String>) -> AnyResult<Vec<Track>> {
        let collection = self.tracks.collection::<Track>();
        let docs = collection.get_multiple(&track_ids).await?;

        self.decode_docs::<Track>(docs)
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
                // Err(bonsaidb::core::Error::DocumentConflict(_err, _)) => {
                //     info!("Track already in library: '{:?}'", &track.path);
                // }
                // TODO:
                Err(err) => {
                    error!("Failed to insert tracks: {:?}", err);
                }
            }
        }

        Ok(())
    }

    /**
     * Get all the playlists (and their content) from the database
     */
    pub async fn get_all_playlists(&self) -> AnyResult<Vec<Playlist>> {
        let timer = TimeLogger::new("Retrieved all playlists from DB".into());
        let collection = self.playlists.collection::<Playlist>();
        let docs = collection.all().await?;
        timer.complete();

        let decode_timer = TimeLogger::new("Decoded all playlists content".into());
        let playlists = self.decode_docs::<Playlist>(docs);
        decode_timer.complete();

        playlists
    }

    /** Get a single playlist by ID */
    pub async fn get_playlist(&self, playlist_id: String) -> AnyResult<Option<Playlist>> {
        let collection = self.playlists.collection::<Playlist>();
        let doc = collection.get(&playlist_id).await?;

        self.decode_doc::<Playlist>(doc)
    }

    /** Create a playlist given a name and a set of track IDs */
    pub async fn create_playlist(&self, name: String, tracks: Vec<String>) -> AnyResult<Playlist> {
        let playlist = Playlist {
            _id: uuid::Uuid::new_v4().to_string(),
            name,
            tracks,
            import_path: None,
        };
        // TODO: insert in DB
        // let collection = self.playlists.collection::<Playlist>();
        // let doc = collection.get(&playlist_id).await?;

        // self.decode_doc::<Playlist>(doc)
        Ok(playlist)
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
        doc: Option<OwnedDocument>,
    ) -> AnyResult<Option<<T as SerializedCollection>::Contents>> {
        match doc {
            Some(doc) => Ok(Some(T::document_contents(&doc)?)),
            None => Ok(None),
        }
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

/** ----------------------------------------------------------------------------
 * Commands
 * -------------------------------------------------------------------------- */

/**
 * Popup a directory picker dialog, scan the selected folders, extract all
 * ID3 tags from it, and update the DB accordingly.
 */
#[tauri::command]
async fn import_tracks_to_library(
    db: State<'_, DB>,
    import_paths: Vec<PathBuf>,
) -> AnyResult<Vec<Track>> {
    info!("Importing paths to library:");

    // for path in import_paths {
    //     info!("  - {:?}", path)
    // }

    let paths = scan_dirs(&import_paths, &constants::SUPPORTED_TRACKS_EXTENSIONS);
    let task_count = paths.len();

    // Let's get all tracks ID3
    info!("Importing ID3 tags from {} files", task_count);
    let scan_logger = TimeLogger::new("Scanned all id3 tags".into());

    let tracks = &paths
        .par_iter()
        .map(|path| -> Option<Track> {
            // TODO: make sure we don't save tracks that are already in DB
            // TODO: friendly log progress to console + set progres on UI

            match lofty::read_from_path(&path) {
                Ok(tagged_file) => {
                    let tag = tagged_file.primary_tag()?;

                    let title = tag.title();
                    let album = tag.album();
                    let artist = tag.artist();
                    let genre = tag.genre();

                    Some(Track {
                        _id: Uuid::new_v3(&Uuid::NAMESPACE_OID, path.to_string_lossy().as_bytes())
                            .to_string(),
                        title: title.as_deref().unwrap_or("Unknown").to_string(),
                        album: album.as_deref().unwrap_or("Unknown").to_string(),
                        // TODO: get multiple artists/genres: https://github.com/Serial-ATA/lofty-rs/issues/55
                        artists: vec![artist.as_deref().unwrap_or("Unknown Artist")]
                            .iter()
                            .map(|&s| s.into())
                            .collect(),
                        genres: vec![genre.as_deref().unwrap_or("")]
                            .iter()
                            .map(|&s| s.into())
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
async fn get_all_playlists(db: State<'_, DB>) -> AnyResult<Vec<Playlist>> {
    db.get_all_playlists().await
}

#[tauri::command]
async fn get_playlist(db: State<'_, DB>, id: String) -> AnyResult<Playlist> {
    match db.get_playlist(id).await {
        Ok(Some(playlist)) => Ok(playlist),
        Ok(None) => Err(MuseeksError::Command {
            message: "Playlist not found".to_string(),
        }),
        Err(err) => Err(err),
    }
}

#[tauri::command]
async fn reset(db: State<'_, DB>) -> AnyResult<()> {
    info!("Resetting DB...");
    let timer = TimeLogger::new("Reset DB".into());

    let tracks_collection = db.tracks.collection::<Track>();
    let tracks = tracks_collection.all().await?;

    let playlists_collection = db.playlists.collection::<Track>();
    let playlists = playlists_collection.all().await?;

    // We create a transaction to make things much faster
    let mut tx = Transaction::new();

    for track in tracks {
        tx.push(Operation::delete(Track::collection_name(), track.header));
    }

    for playlist in playlists {
        tx.push(Operation::delete(
            Playlist::collection_name(),
            playlist.header,
        ));
    }

    tx.apply_async(&db.tracks).await?;

    timer.complete();

    Ok(())
}

#[tauri::command]
fn get_cover(path: String) -> AnyResult<Option<String>> {
    // TODO: if None, scan folder for cover.jpg/png instead
    let tagged_file = lofty::read_from_path(path);

    if tagged_file.is_err() {
        return Ok(None);
    }

    let binding = tagged_file.unwrap();
    let tag = binding.primary_tag();

    let (format, data) = match tag {
        Some(tag) => {
            let maybe_cover = tag.pictures().first();
            match maybe_cover {
                Some(cover) => {
                    let format = match cover.mime_type() {
                        Some(MimeType::Png) => Some("png".to_string()),
                        Some(MimeType::Jpeg) => Some("jpg".to_string()),
                        Some(MimeType::Tiff) => Some("tiff".to_string()),
                        Some(MimeType::Bmp) => Some("bmp".to_string()),
                        Some(MimeType::Gif) => Some("gif".to_string()),
                        _ => None,
                    };
                    (format, BASE64_STANDARD.encode(&cover.data()))
                }
                None => return Ok(None),
            }
        }
        None => return Ok(None),
    };

    if format.is_none() {
        debug!("Cover has no format");
        return Ok(None);
    }

    debug!("Cover was found (base 64)");
    Ok(Some(format!("data:{};base64,{}", format.unwrap(), data)))
}

/**
 * Database setup
 * Doc: https://github.com/khonsulabs/bonsaidb/blob/main/examples/basic-local/examples/basic-local-multidb.rs
 */
pub async fn setup() -> AnyResult<DB> {
    let conf_path = get_app_storage_dir();
    let storage_configuration = StorageConfiguration::new(conf_path.join("main.bonsaidb"))
        .with_schema::<Track>()?
        .with_schema::<Playlist>()?;

    let storage = AsyncStorage::open(storage_configuration).await?;

    let db_tracks = storage.create_database::<Track>("tracks", true).await?;
    let db_playlists = storage
        .create_database::<Playlist>("playlists", true)
        .await?;

    Ok(DB {
        tracks: db_tracks,
        playlists: db_playlists,
    })
}

/**
 * Database plugin, exposing commands and state
 */
pub fn init<R: Runtime>(db: DB) -> TauriPlugin<R> {
    Builder::<R>::new("database")
        .invoke_handler(tauri::generate_handler![
            get_all_tracks,
            get_tracks,
            get_all_playlists,
            get_playlist,
            reset,
            import_tracks_to_library,
            get_cover,
        ])
        .setup(|app_handle, _api| {
            app_handle.manage(db);
            Ok(())
        })
        .build()
}
