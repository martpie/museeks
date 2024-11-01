use geekorm::GeekConnector;
use log::{error, info, warn};
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::path::PathBuf;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};
use tauri::plugin::{Builder, TauriPlugin};
use tauri::Emitter;
use tauri::{Manager, Runtime, State};
use tauri_plugin_dialog::{DialogExt, FilePath};
use ts_rs::TS;

use tokio_rusqlite::Connection;

use crate::libs::error::{AnyResult, MuseeksError};
use crate::libs::events::IPCEvent;
use crate::libs::playlist::Playlist;
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

pub struct DB<'a> {
    pub connection: Connection,
}

impl DB {
    /**
     * Get all the tracks (and their content) from the database
     */
    pub async fn get_all_tracks(&self) -> AnyResult<Vec<Track>> {
        let timer = TimeLogger::new("Retrieved and decoded tracks".into());
        let tracks = Track::fetch_all(&self.connection).await?;
        timer.complete();
        Ok(tracks)
    }

    /**
     * Get tracks (and their content) given a set of document IDs
     */
    pub async fn get_tracks(&self, track_ids: &Vec<String>) -> AnyResult<Vec<Track>> {
        // TODO
        // let query = Track::query_select().where_like().build()?;
        // let mut tracks = Track::query(&self.connection, query).await?;
        let mut tracks: Vec<Track> = vec![];

        // document may not ordered the way we want, so let's ensure they map to track_ids
        let track_id_positions: HashMap<&String, usize> = track_ids
            .iter()
            .enumerate()
            .map(|(i, id)| (id, i))
            .collect();
        tracks.sort_by_key(|track| track_id_positions.get(&track.id));

        Ok(tracks)
    }

    /**
     * Get tracks (and their content) given a set of document IDs
     */
    pub async fn update_track(&self, track: &mut Track) -> AnyResult<()> {
        track.update(&self.connection).await?;
        Ok(())
    }

    /** Delete multiple tracks by ID */
    pub async fn remove_tracks(&self, track_ids: &Vec<String>) -> AnyResult<()> {
        // TODO: batch that, use DELETE statement instead
        let tracks = self.get_tracks(track_ids).await?;

        for track in tracks {
            track.delete(&self.connection).await?
        }

        Ok(())
    }

    /**
     * Insert a new track in the DB, will fail in case there is a duplicate unique
     * key (like track.path)
     *
     * Doc: https://github.com/khonsulabs/bonsaidb/blob/main/examples/basic-local/examples/basic-local-multidb.rs
     */
    pub async fn insert_tracks(&self, tracks: &mut Vec<Track>) -> AnyResult<()> {
        // BonsaiDB does not work well (as of today) with a lot of very small
        // insertions, so let's insert tracks by batch instead.
        // If a batch fails (because for example a duplicate path), the whole transaction
        // will fail. This should not happen except something is really wrong (hash collision,
        // no disk space, etc).
        // let batches: Vec<Vec<Track>> = tracks.chunks(INSERTION_BATCH).map(|x| x.to_vec()).collect();

        // for batch in batches {
        //     let mut tx = Transaction::new();

        //     for track in batch {
        //         tx.push(Operation::push_serialized::<Track>(&track)?);
        //     }

        //     // Let's goooo
        //     let result = tx.apply_async(&self.tracks).await;

        //     match result {
        //         Ok(_) => (),
        //         Err(err) => {
        //             error!("Failed to insert tracks: {:?}", err);
        //         }
        //     }
        // }

        for track in tracks {
            // TODO: batch this
            track.save(&self.connection).await?;
        }

        Ok(())
    }

    /** Get all the playlists (and their content) from the database */
    pub async fn get_all_playlists(&self) -> AnyResult<Vec<Playlist>> {
        let timer = TimeLogger::new("Retrieved and decoded playlists".into());
        let mut playlists = Playlist::fetch_all(&self.connection).await?;

        // Ensure the playlists are sorted alphabetically (case-insensitive) for better UX
        playlists.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

        timer.complete();
        Ok(playlists)
    }

    /** Get a single playlist by ID */
    pub async fn get_playlist(&self, playlist_id: &String) -> AnyResult<Option<Playlist>> {
        let mut playlists = Playlist::fetch_by_id(&self.connection, playlist_id).await?;

        Ok(self.get_first(&mut playlists))
    }

    /** Create a playlist given a name and a set of track IDs */
    pub async fn create_playlist(
        &self,
        name: String,
        tracks_ids: Vec<String>,
        import_path: Option<PathBuf>,
    ) -> AnyResult<Playlist> {
        let playlist_path: Option<String> = match import_path {
            Some(path) => Some(path.to_str().unwrap().to_string()),
            None => None,
        };

        let mut playlist = Playlist {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            tracks: tracks_ids,
            import_path: playlist_path,
        };

        playlist.save(&self.connection).await?;

        Ok(playlist)
    }

    /** Set the tracks of a playlist given its ID and tracks IDs */
    pub async fn set_playlist_tracks(
        &self,
        id: &String,
        tracks: Vec<String>,
    ) -> AnyResult<Playlist> {
        let mut playlists = Playlist::fetch_by_id(&self.connection, id).await?;
        let maybe_playlist = self.get_first(&mut playlists);

        match maybe_playlist {
            Some(mut playlist) => {
                playlist.tracks = tracks;
                playlist.update(&self.connection).await?;

                Ok(playlist)
            }
            _ => Err(MuseeksError::PlaylistNotFound),
        }
    }

    /** Update a playlist name by ID */
    pub async fn rename_playlist(&self, id: &String, name: String) -> AnyResult<Playlist> {
        let mut playlists = Playlist::fetch_by_id(&self.connection, id).await?;
        let maybe_playlist = self.get_first(&mut playlists);

        match maybe_playlist {
            Some(mut playlist) => {
                playlist.name = name;
                playlist.update(&self.connection).await?;

                Ok(playlist)
            }
            _ => Err(MuseeksError::PlaylistNotFound),
        }
    }

    /** Delete a playlist by ID */
    pub async fn delete_playlist(&self, id: &String) -> AnyResult<()> {
        let mut playlists = Playlist::fetch_by_id(&self.connection, id).await?;
        let maybe_playlist = self.get_first(&mut playlists);

        match maybe_playlist {
            Some(playlist) => {
                playlist.delete(&self.connection).await?;

                Ok(())
            }
            _ => Err(MuseeksError::PlaylistNotFound),
        }
    }

    /**
     * Helpers
     */

    /** Get the first item of a vec, consuming it */
    fn get_first<T>(&self, list: &mut Vec<T>) -> Option<T> {
        if list.is_empty() {
            return None;
        }

        let item = list.remove(0);

        Some(item)
    }
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
    db_state: State<'_, std::sync::RwLock<DB>>,
    import_paths: Vec<PathBuf>,
) -> AnyResult<ScanResult> {
    let db = db_state.lock().await;

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
        .map(move |track| PathBuf::from(track.path.to_owned()))
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

    let mut tracks = track_paths
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
    let result = db.insert_tracks(&mut tracks).await;

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
        .map(PathBuf::from)
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
async fn get_all_tracks(db_state: State<'_, Mutex<Connection>>) -> AnyResult<Vec<Track>> {
    return Ok(vec![]);
    // db_state.lock().await.get_all_tracks().await
}

#[tauri::command]
async fn get_tracks(db_state: State<'_, DBState>, ids: Vec<String>) -> AnyResult<Vec<Track>> {
    db_state.get_lock().await.get_tracks(&ids).await
}

#[tauri::command]
async fn update_track(db_state: State<'_, DBState>, track: Track) -> AnyResult<Track> {
    db_state.get_lock().await.update_track(track).await
}

#[tauri::command]
async fn remove_tracks(db_state: State<'_, DBState>, ids: Vec<String>) -> AnyResult<()> {
    db_state.get_lock().await.remove_tracks(&ids).await
}

#[tauri::command]
async fn get_all_playlists(db_state: State<'_, DBState>) -> AnyResult<Vec<Playlist>> {
    db_state.get_lock().await.get_all_playlists().await
}

#[tauri::command]
async fn get_playlist(db_state: State<'_, DBState>, id: String) -> AnyResult<Playlist> {
    match db_state.get_lock().await.get_playlist(&id).await {
        Ok(Some(playlist)) => Ok(playlist),
        Ok(None) => Err(MuseeksError::PlaylistNotFound),
        Err(err) => Err(err),
    }
}

#[tauri::command]
async fn create_playlist(
    db_state: State<'_, DBState>,
    name: String,
    ids: Vec<String>,
    import_path: Option<PathBuf>,
) -> AnyResult<Playlist> {
    db_state
        .get_lock()
        .await
        .create_playlist(name, ids, import_path)
        .await
}

#[tauri::command]
async fn rename_playlist(
    db_state: State<'_, DBState>,
    id: String,
    name: String,
) -> AnyResult<Playlist> {
    db_state.get_lock().await.rename_playlist(&id, name).await
}

#[tauri::command]
async fn set_playlist_tracks(
    db_state: State<'_, DBState>,
    id: String,
    tracks: Vec<String>,
) -> AnyResult<Playlist> {
    db_state
        .get_lock()
        .await
        .set_playlist_tracks(&id, tracks)
        .await
}

#[tauri::command]
async fn export_playlist<R: Runtime>(
    window: tauri::Window<R>,
    db_state: State<'_, DBState>,
    id: String,
) -> AnyResult<()> {
    let db = db_state.get_lock().await;

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
async fn delete_playlist(db_state: State<'_, DBState>, id: String) -> AnyResult<()> {
    db_state.get_lock().await.delete_playlist(&id).await
}

#[tauri::command]
async fn reset(_db_state: State<'_, DBState>) -> AnyResult<()> {
    info!("Resetting DB...");
    let timer = TimeLogger::new("Reset DB".into());

    // TODO
    // let tracks = db.tracks_collection().all().await?;
    // let playlists = db.playlists_collection().all().await?;

    // // We create a transaction to delete tracks much faster
    // let mut tx = Transaction::new();

    // for track in tracks {
    //     tx.push(Operation::delete(Track::collection_name(), track.header));
    // }

    // tx.apply_async(&db.tracks).await?;

    // // Now let's delete playlists
    // tx = Transaction::new();

    // for playlist in playlists {
    //     tx.push(Operation::delete(
    //         Playlist::collection_name(),
    //         playlist.header,
    //     ));
    // }

    // tx.apply_async(&db.playlists).await?;

    timer.complete();

    Ok(())
}

// static MIGRATIONS_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/migrations");

/**
 * Database setup
 * Doc: https://github.com/khonsulabs/bonsaidb/blob/main/examples/basic-local/examples/basic-local-multidb.rs
 */
async fn setup() -> AnyResult<DB> {
    let database_path = get_storage_dir().join("museeks.db");

    // // sqlx needs at least an empty file to work with
    // std::fs::OpenOptions::new()
    //     .write(true)
    //     .create_new(true)
    //     .open(&database_path)?;

    info!("Opening connection to database: {:?}", database_path);

    let connection = Connection::open(&database_path)?;

    Track::create_table(&connection).await?;
    Playlist::create_table(&connection).await?;

    // Run the migrations for the DB
    // let migrations: Migrations<'_> = Migrations::from_directory(&MIGRATIONS_DIR).unwrap();
    // migrations.to_version(&mut connection, 1)?; // CHANGE THAT AFTER ADDING A MIGRATION

    Ok(DB { connection })
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
                app_handle.manage(DBState { 0: Mutex::new(db) });
            });
            Ok(())
        })
        .build()
}
