use log::{info, warn};
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use std::path::PathBuf;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};

use crate::libs::track::{get_track_from_file, get_track_from_insert_track};
use crate::libs::utils::is_file_valid;
use crate::plugins::database::SUPPORTED_TRACKS_EXTENSIONS;

use super::events::IPCEvent;

/**
 * Linux + Windows
 */
#[cfg(any(windows, target_os = "linux"))]
pub fn setup_file_associations(app: &tauri::App) {
    let mut files = Vec::new();

    // NOTICE: `args` may include URL protocol (`your-app-protocol://`)
    // or arguments (`--`) if your app supports them.
    // files may aslo be passed as `file://path/to/file`
    for maybe_file in std::env::args().skip(1) {
        // skip flags like -f or --flag
        if maybe_file.starts_with("-") {
            continue;
        }

        // handle `file://` path urls and skip other urls
        if let Ok(url) = tauri::Url::parse(&maybe_file) {
            // FIXME: produces nothing on Windows with C:\ Urls
            if let Ok(path) = url.to_file_path() {
                files.push(path);
            }
        } else {
            files.push(PathBuf::from(maybe_file))
        }
    }

    handle_file_associations(app.handle().clone(), files);
}

/**
 * macOS
 */
#[cfg(target_os = "macos")]
pub fn setup_file_associations(app_handle: &AppHandle, event: tauri::RunEvent) {
    if let tauri::RunEvent::Opened { urls } = event {
        let files = urls
            .into_iter()
            .filter_map(|url| url.to_file_path().ok())
            .collect::<Vec<_>>();

        handle_file_associations(app_handle.clone(), files);
    }
}

/**
 * Handle the app file association.
 * For audio files, it will scan the files, create a queue and play it, *without* adding the tracks to the library.
 * For playlists files, not implemented.
 */
fn handle_file_associations(app_handle: AppHandle, mut files: Vec<PathBuf>) {
    info!("Handling the opening of the following files:");
    for file in &files {
        info!("  - {:?}", file)
    }

    files = files
        .into_iter()
        .filter(|path| is_file_valid(path, &SUPPORTED_TRACKS_EXTENSIONS))
        .collect();

    // This is for the `asset:` protocol to work, ensuring access to the files
    let asset_protocol_scope = app_handle.asset_protocol_scope();

    for file in &files {
        let _ = asset_protocol_scope.allow_file(file);
    }

    // Build a list of tracks, without importing them to the library
    let queue = files
        .par_iter()
        .map(|path| get_track_from_file(&path))
        .flatten()
        .map(get_track_from_insert_track)
        .collect::<Vec<_>>();

    let window = app_handle.get_webview_window("main");

    match window {
        Some(window) => {
            match window.emit(IPCEvent::PlaybackStart.as_ref(), queue) {
                Ok(_) => (),
                Err(err) => app_handle
                    .dialog()
                    .message(format!(
                        "Something went wrong when attempting to play this file: {}",
                        err
                    ))
                    .kind(MessageDialogKind::Error)
                    .show(|_| {}),
            };
        }
        None => {
            warn!("Main window not created, cannot open the files...");
        }
    }
}
