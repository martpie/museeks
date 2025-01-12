use log::{error, info, warn};
use ormlite::sqlite::{SqliteConnectOptions, SqliteConnection};
use ormlite::{Connection, TableMeta};
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::path::PathBuf;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::Emitter;
use tauri::{Manager, Runtime, State};
use tauri_plugin_dialog::{DialogExt, FilePath};
use tokio::sync::{Mutex, MutexGuard};
use ts_rs::TS;

use crate::libs::database::{DB, SUPPORTED_PLAYLISTS_EXTENSIONS, SUPPORTED_TRACKS_EXTENSIONS};
use crate::libs::error::{AnyResult, SyncudioError};
use crate::libs::events::IPCEvent;
use crate::libs::playlist::Playlist;
use crate::libs::track::{get_track_from_file, get_track_id_for_path, Track};
use crate::libs::utils::{scan_dirs, TimeLogger};

use super::config::get_storage_dir;

// Connection is mutable, so we must wrap the state in a mutex to make sure there
// are no concurrency issues
pub struct DBState(Mutex<DB>);

impl DBState {
    async fn get_lock(&self) -> MutexGuard<'_, DB> {
        self.0.lock().await
    }
}

/**
 * Database setup
 * Doc: https://github.com/khonsulabs/bonsaidb/blob/main/examples/basic-local/examples/basic-local-multidb.rs
 */
async fn setup() -> AnyResult<DB> {
    let database_path = get_storage_dir().join("syncudio.db");

    info!("Opening connection to database: {:?}", database_path);

    let options = SqliteConnectOptions::new()
        .filename(&database_path)
        .create_if_missing(true)
        .optimize_on_close(true, None)
        .auto_vacuum(ormlite::sqlite::SqliteAutoVacuum::Incremental)
        .journal_mode(ormlite::sqlite::SqliteJournalMode::Wal);

    let connection = SqliteConnection::connect_with(&options).await?;

    Ok(DB { connection })
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
 * TODO: move that to libs/database
 */
#[tauri::command]
async fn import_tracks_to_library<R: Runtime>(
    window: tauri::Window<R>,
    db_state: State<'_, DBState>,
    import_paths: Vec<PathBuf>,
) -> AnyResult<ScanResult> {
    let mut db = db_state.get_lock().await;

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

    let tracks = track_paths
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
        error!(
            "Something went wrong when inserting tracks: {}",
            result.err().unwrap()
        );
    }

    db_insert_logger.complete();

    // Now that all tracks are inserted, let's scan for playlists, and import them
    let mut playlist_paths = scan_dirs(&import_paths, &SUPPORTED_PLAYLISTS_EXTENSIONS);

    // Ignore playlists that are already in the DB (speedup scan + prevent duplicate errors)
    let existing_playlists_paths = db
        .get_all_playlists()
        .await?
        .iter()
        .filter_map(move |playlist| playlist.import_path.to_owned())
        .map(PathBuf::from)
        .collect::<HashSet<_>>();

    playlist_paths.retain(|path| !existing_playlists_paths.contains(path));

    info!("Found {} playlist(s) to import", playlist_paths.len());

    // Start scanning the content of the playlists and adding them to the DB
    for playlist_path in playlist_paths {
        let res = {
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
                        _ => None, // We don't support (yet?) URLs in playlists
                    }
                })
                .collect();

            // Ok, this is sketchy. To avoid having to create a TrackByPath DB View,
            // let's guess the ID of the track with UUID::v3
            let track_ids = track_paths
                .iter()
                .flat_map(get_track_id_for_path)
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
            Ok::<(), SyncudioError>(())
        };

        match res {
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
async fn get_all_tracks(db_state: State<'_, DBState>) -> AnyResult<Vec<Track>> {
    db_state.get_lock().await.get_all_tracks().await
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
        Ok(None) => Err(SyncudioError::PlaylistNotFound),
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
    let mut db = db_state.get_lock().await;

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
                        pathdiff::diff_paths(&track.path, playlist_dir_path).unwrap();
                    m3u::path_entry(relative_path)
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
async fn reset(db_state: State<'_, DBState>) -> AnyResult<()> {
    info!("Resetting DB...");
    let timer = TimeLogger::new("Reset DB".into());

    let mut db = db_state.get_lock().await;

    let delete_tracks_query = format!("DELETE FROM {};", Track::table_name());
    let delete_playlists_query = format!("DELETE FROM {};", Playlist::table_name());

    ormlite::query(&delete_tracks_query)
        .execute(&mut db.connection)
        .await?;
    ormlite::query(&delete_playlists_query)
        .execute(&mut db.connection)
        .await?;
    ormlite::query("VACUUM;")
        .execute(&mut db.connection)
        .await?;

    timer.complete();

    Ok(())
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
                let mut db = match setup().await {
                    Ok(db) => db,
                    Err(err) => {
                        error!("Failed to setup database: {:?}", err);
                        return;
                    }
                };

                db.create_tables()
                    .await
                    .expect("Could not create DB tables");

                app_handle.manage(DBState(Mutex::new(db)));
            });
            Ok(())
        })
        .build()
}
