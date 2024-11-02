use log::{error, info, warn};
use ormlite::model::ModelBuilder;
use ormlite::sqlite::SqliteConnection;
use ormlite::{Connection, Model, TableMeta};
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
use tokio::sync::{Mutex, MutexGuard};
use ts_rs::TS;

use crate::libs::error::{AnyResult, MuseeksError};
use crate::libs::events::IPCEvent;
use crate::libs::playlist::Playlist;
use crate::libs::track::{get_track_from_file, get_track_id_for_path, Track};
use crate::libs::utils::{scan_dirs, TimeLogger};

use super::config::get_storage_dir;

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

// Connection is mutable, so we must wrap the state in a mutex to make sure there
// are no concurrency issues
pub struct DBState(Mutex<DB>);

impl DBState {
    async fn get_lock(&self) -> MutexGuard<'_, DB> {
        self.0.lock().await
    }
}

pub struct DB {
    pub connection: SqliteConnection,
}

impl DB {
    /**
     * Get all the tracks (and their content) from the database
     */
    pub async fn get_all_tracks(&mut self) -> AnyResult<Vec<Track>> {
        let timer = TimeLogger::new("Retrieved and decoded tracks".into());
        let tracks = Track::select().fetch_all(&mut self.connection).await?;
        timer.complete();
        Ok(tracks)
    }

    /**
     * Get tracks (and their content) given a set of document IDs
     */
    pub async fn get_tracks(&mut self, track_ids: &Vec<String>) -> AnyResult<Vec<Track>> {
        // TODO: Can this be improved somehow?
        // Improve me once https://github.com/launchbadge/sqlx/issues/875 is fixed
        let placeholders = track_ids.iter().map(|_| "?").collect::<Vec<_>>().join(", ");
        let where_statement = format!("id IN ({})", placeholders);

        let mut query_builder = Track::select().dangerous_where(&where_statement);

        for id in track_ids {
            query_builder = query_builder.bind(id);
        }

        let mut tracks: Vec<Track> = query_builder.fetch_all(&mut self.connection).await?;

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
    pub async fn update_track(&mut self, track: Track) -> AnyResult<Track> {
        let updated_track = track.update_all_fields(&mut self.connection).await?;
        Ok(updated_track)
    }

    /** Delete multiple tracks by ID */
    pub async fn remove_tracks(&mut self, track_ids: &Vec<String>) -> AnyResult<()> {
        // TODO: batch that, use DELETE statement instead
        let tracks = self.get_tracks(track_ids).await?;

        for track in tracks {
            track.delete(&mut self.connection).await?
        }

        Ok(())
    }

    /**
     * Insert a new track in the DB, will fail in case there is a duplicate unique
     * key (like track.path)
     *
     * Doc: https://github.com/khonsulabs/bonsaidb/blob/main/examples/basic-local/examples/basic-local-multidb.rs
     */
    pub async fn insert_tracks(&mut self, tracks: Vec<Track>) -> AnyResult<()> {
        // Weirdly, this is fast enough with SQLite, no need to create transactions
        for track in tracks {
            track.insert(&mut self.connection).await?;
        }

        Ok(())
    }

    /** Get all the playlists (and their content) from the database */
    pub async fn get_all_playlists(&mut self) -> AnyResult<Vec<Playlist>> {
        let timer = TimeLogger::new("Retrieved and decoded playlists".into());
        let mut playlists = Playlist::select()
            .order_asc("name")
            .fetch_all(&mut self.connection)
            .await?;

        // Ensure the playlists are sorted alphabetically (case-insensitive) for better UX
        playlists.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

        timer.complete();
        Ok(playlists)
    }

    /** Get a single playlist by ID */
    pub async fn get_playlist(&mut self, playlist_id: &String) -> AnyResult<Option<Playlist>> {
        let playlist = Playlist::select()
            .where_bind("id = ?", playlist_id)
            .fetch_one(&mut self.connection)
            .await?;

        Ok(Some(playlist))
    }

    /** Create a playlist given a name and a set of track IDs */
    pub async fn create_playlist(
        &mut self,
        name: String,
        tracks_ids: Vec<String>,
        import_path: Option<PathBuf>,
    ) -> AnyResult<Playlist> {
        let playlist_path: Option<String> = match import_path {
            Some(path) => Some(path.to_str().unwrap().to_string()),
            None => None,
        };

        let playlist = Playlist {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            tracks: tracks_ids,
            import_path: playlist_path,
        };

        let playlist = playlist.insert(&mut self.connection).await?;

        Ok(playlist)
    }

    /** Set the tracks of a playlist given its ID and tracks IDs */
    pub async fn set_playlist_tracks(
        &mut self,
        id: &String,
        tracks: Vec<String>,
    ) -> AnyResult<Playlist> {
        let playlist = Playlist::select()
            .where_bind("id = ?", id)
            .fetch_one(&mut self.connection)
            .await?;

        let updated_playlist = playlist
            .update_partial()
            .tracks(tracks)
            .update(&mut self.connection)
            .await?;

        Ok(updated_playlist)
    }

    /** Update a playlist name by ID */
    pub async fn rename_playlist(&mut self, id: &String, name: String) -> AnyResult<Playlist> {
        let playlist = Playlist::select()
            .where_bind("id = ?", id)
            .fetch_one(&mut self.connection)
            .await?;

        let updated_playlist = playlist
            .update_partial()
            .name(name)
            .update(&mut self.connection)
            .await?;

        Ok(updated_playlist)
    }

    /** Delete a playlist by ID */
    pub async fn delete_playlist(&mut self, id: &String) -> AnyResult<()> {
        let playlist = Playlist::select()
            .where_bind("id = ?", id)
            .fetch_one(&mut self.connection)
            .await?;

        playlist.delete(&mut self.connection).await?;

        Ok(())
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
 * Database setup
 * Doc: https://github.com/khonsulabs/bonsaidb/blob/main/examples/basic-local/examples/basic-local-multidb.rs
 */
async fn setup() -> AnyResult<DB> {
    let database_path = get_storage_dir().join("museeks.db");

    // sqlx needs at least an empty file to work with
    std::fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&database_path)
        .ok(); // TODO: if files already exists, ok, otherwise, return error

    let mut sqlite_database_path = "sqlite:".to_owned();
    sqlite_database_path.push_str(database_path.to_str().expect("Failed to get database path"));

    info!("Opening connection to database: {:?}", sqlite_database_path);

    let mut connection = SqliteConnection::connect(&sqlite_database_path).await?;

    // TODO: move that to SQL files, or derive that from the struct itself, probably need to create a PR for ormlite-cli
    ormlite::query(
        "CREATE TABLE IF NOT EXISTS tracks (
            id TEXT PRIMARY KEY NOT NULL,
            path TEXT NOT NULL UNIQUE, -- Path as a string and unique
            title TEXT NOT NULL,
            album TEXT NOT NULL,
            artists JSON NOT NULL, -- Array of strings
            genres JSON NOT NULL, -- Array of strings
            year INTEGER,
            duration INTEGER NOT NULL,
            track_no INTEGER,
            track_of INTEGER,
            disk_no INTEGER,
            disk_of INTEGER
        );",
    )
    .execute(&mut connection)
    .await?;

    // Index for the path column in Track
    ormlite::query("CREATE INDEX IF NOT EXISTS index_track_path ON tracks (path);")
        .execute(&mut connection)
        .await?;

    ormlite::query(
        "CREATE TABLE IF NOT EXISTS playlists (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            tracks JSON NOT NULL DEFAULT '[]', -- Array of track IDs
            import_path TEXT UNIQUE -- Path of the playlist file, unique if it exists
        );",
    )
    .execute(&mut connection)
    .await?;

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
