use base64::prelude::*;
use bonsaidb::core::connection::{AsyncConnection, AsyncStorageConnection};
use bonsaidb::core::document::{BorrowedDocument, Emit};
use bonsaidb::core::schema::{
    Collection, MapReduce, ReduceResult, SerializedCollection, View, ViewMapResult,
    ViewMappedValue, ViewSchema,
};
use bonsaidb::core::transaction::{Operation, Transaction};
use bonsaidb::local::config::{Builder as BonsaiBuilder, StorageConfiguration};
use bonsaidb::local::AsyncDatabase;
use bonsaidb::local::AsyncStorage;
use lofty::{Accessor, AudioFile, MimeType, TaggedFileExt};
use log::{debug, info, warn};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, Runtime, State};
use ts_rs::TS;

use crate::constants;
use crate::libs::error::AnyResult;
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
    pub async fn get_all_tracks(&self) -> AnyResult<Vec<Doc<Track>>> {
        let timer = TimeLogger::new("Retrieved all tracks from DB".into());

        let collection = self.tracks.collection::<Track>();
        let docs = collection.all().await?;

        timer.complete();

        let decode_timer = TimeLogger::new("Decoded all tracks content".into());

        let mut tracks = vec![];

        for doc in docs {
            let deserialized = Track::document_contents(&doc)?;
            let parsed_document = Doc {
                id: doc.header.id.to_string(),
                doc: deserialized,
            };

            tracks.push(parsed_document);
        }

        decode_timer.complete();

        Ok(tracks)
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
        let batches: Vec<Vec<Track>> = tracks.chunks(INSERTION_BATCH).map(|x| x.to_vec()).collect();

        info!("Splitting tracks in {} batche(s)", batches.len());

        for batch in batches {
            let mut tx = Transaction::new();

            for track in batch {
                tx.push(Operation::push_serialized::<Track>(&track)?);
            }

            // Let's goooo
            tx.apply_async(&self.tracks).await?;
        }

        Ok(())
    }

    /**
     * Get all the playlists (and their content) from the database
     */
    pub async fn get_all_playlists(&self) -> AnyResult<Vec<Doc<Playlist>>> {
        let timer = TimeLogger::new("Retrieved all playlists from DB".into());

        let collection = self.playlists.collection::<Playlist>();
        let docs = collection.all().await?;

        timer.complete();

        let decode_timer = TimeLogger::new("Decoded all playlists content".into());

        let mut playlists = vec![];

        for doc in docs {
            let deserialized = Playlist::document_contents(&doc)?;
            let parsed_document = Doc {
                id: doc.header.id.to_string(),
                doc: deserialized,
            };

            playlists.push(parsed_document);
        }

        decode_timer.complete();

        Ok(playlists)
    }

    // TODO: find tracks by IDs
    // TODO: find playlist by ID
}

/** ----------------------------------------------------------------------------
 * Track
 * represent a single track, id and path should be unique
 * -------------------------------------------------------------------------- */
#[derive(Debug, Clone, Serialize, Deserialize, Collection, TS)]
#[collection(name = "tracks", views = [TracksByPath])]
#[ts(export, export_to = "../src/generated/typings/Track.ts")]
pub struct Track {
    pub title: String,
    pub album: String,
    pub artists: Vec<String>,
    pub genres: Vec<String>,
    pub year: Option<u32>,
    pub duration: u32,
    pub track: NumberOf,
    pub disk: NumberOf,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../src/generated/typings/NumberOf.ts")]
pub struct NumberOf {
    pub no: Option<u32>,
    pub of: Option<u32>,
}

// TODO: unique is not workinf
// TrackByPath is a DB view to quickly access a Track by its location on the
// filesystem. Mostly used to query some data DB.
#[derive(Debug, Clone, View, ViewSchema)]
#[view(collection = Track, key = String, value = usize, name = "by-path")]
pub struct TracksByPath;

impl MapReduce for TracksByPath {
    fn map<'doc>(&self, document: &'doc BorrowedDocument<'_>) -> ViewMapResult<'doc, Self> {
        let track = Track::document_contents(document)?;
        document.header.emit_key_and_value(track.path, 1)
    }

    fn reduce(
        &self,
        mappings: &[ViewMappedValue<Self::View>],
        _rereduce: bool,
    ) -> ReduceResult<Self::View> {
        Ok(mappings.iter().map(|mapping| mapping.value).sum())
    }
}

/** ----------------------------------------------------------------------------
 * Playlist
 * represent a playlist, that has a name and a list of tracks
 * -------------------------------------------------------------------------- */

#[derive(Debug, Clone, Serialize, Deserialize, Collection, TS)]
#[collection(name = "playlists")]
#[ts(export, export_to = "../src/generated/typings/Playlist.ts")]
pub struct Playlist {
    pub name: String,
    pub tracks: Vec<String>, // vector of IDs
    pub import_path: String,
}

/** ----------------------------------------------------------------------------
 * Struct Helpers
 * -------------------------------------------------------------------------- */

// Struct helper useful to include the DB ID in addition to the actual fields
// of a document
#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../src/generated/typings/Doc.ts")]
pub struct Doc<T> {
    pub id: String,
    pub doc: T,
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
    import_paths: Vec<String>,
) -> AnyResult<Vec<Doc<Track>>> {
    info!("Importing path {}", import_paths.join(", "));

    let paths = scan_dirs(&import_paths, &constants::SUPPORTED_TRACKS_EXTENSIONS);
    let task_count = paths.len();

    // Let's get all tracks ID3
    info!("Importing ID3 tags from {} files", task_count);
    let scan_logger = TimeLogger::new("Scanned all id3 tags".into());

    let tracks = &paths
        .par_iter()
        .map(|path| -> Option<Track> {
            let saved_path = path.to_string(); // Why do I need to copy this?

            // TODO: make sure we don't save tracks that are already in DB
            // TODO: friendly log progress to console + set progres on UI

            let track = match lofty::read_from_path(&path) {
                Ok(tagged_file) => {
                    let tag = tagged_file.primary_tag()?;

                    let title = tag.title();
                    let album = tag.album();
                    let artist = tag.artist();
                    let genre = tag.genre();

                    Some(Track {
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
                        path: path.to_string(),
                    })
                }
                Err(err) => {
                    warn!("Failed to get ID3 tags: \"{}\". File {}", err, saved_path);
                    None
                }
            };

            return track;
        })
        .flatten()
        .collect::<Vec<Track>>();

    info!("{} tracks successfully scanned", tracks.len());
    info!("{} tracks failed to be scanned", paths.len() - tracks.len());
    scan_logger.complete();

    let db_insert_logger = TimeLogger::new("Inserted tracks".into());

    // Insert all tracks in the DB
    let result = db.insert_track(tracks).await;

    if result.is_err() {
        warn!("Something went wrong when inserting tracks");
    }

    db_insert_logger.complete();

    let tracks = db.get_all_tracks().await.unwrap();

    Ok(tracks)
}

/**
 * Return all the tracks from the DB
 */
#[tauri::command]
async fn get_all_tracks(db: State<'_, DB>) -> AnyResult<Vec<Doc<Track>>> {
    db.get_all_tracks().await
}

/**
 * Return all the tracks from the DB
 */
#[tauri::command]
async fn get_all_playlists(db: State<'_, DB>) -> AnyResult<Vec<Doc<Playlist>>> {
    db.get_all_playlists().await
}

/**
 * Try to get the cover as a base64 image for a given track path
 */
#[tauri::command]
fn get_cover_as_base64(path: String) -> AnyResult<Option<String>> {
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

pub fn init<R: Runtime>(db: DB) -> TauriPlugin<R> {
    Builder::<R>::new("database")
        .invoke_handler(tauri::generate_handler![
            import_tracks_to_library,
            get_all_tracks,
            get_all_playlists,
            get_cover_as_base64
        ])
        .setup(|app_handle, _api| {
            app_handle.manage(db);
            Ok(())
        })
        .build()
}
