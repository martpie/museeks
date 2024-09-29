use log::info;
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use std::path::PathBuf;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};

use crate::libs::track::get_track_from_file;
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
        info!("TADATA {}", maybe_file);
        // skip flags like -f or --flag
        if maybe_file.starts_with("-") {
            info!("startwith -");
            continue;
        }

        // handle `file://` path urls and skip other urls
        // if let Ok(mut url) = url::Url::parse(&maybe_file) {
        //     info!("prased URL {}", url);

        //     match url.set_scheme("file") {
        //         Ok(()) => info!("added file as scheme"),
        //         Err(err) => info!("failed"),
        //     }

        //     match url.to_file_path() {
        //         Ok(path) => {
        //             info!("to file path URL {:#?}", path);
        //             files.push(path);
        //         }
        //         Err(err) => {
        //             info!("FAILED {:#?}", err);
        //         }
        //     }
        // } else {
        info!("? {}", maybe_file);
        files.push(PathBuf::from(maybe_file))
        // }
    }

    info!("Hello??? {:#?}", files);

    if files.len() == 0 {
        return;
    }

    handle_file_associations(app.handle().clone(), files);
}

/**
 * macOS
 */
#[cfg(target_os = "macos")]
pub fn setup_file_associations(app: &AppHandle, event: tauri::RunEvent) {
    if let tauri::RunEvent::Opened { urls } = event {
        let files = urls
            .into_iter()
            .filter_map(|url| url.to_file_path().ok())
            .collect::<Vec<_>>();

        handle_file_associations(app.clone(), files);
    }
}

/**
 * Handle the app file association.
 * For audio files, it will scan the files, create a queue and play it, *without* adding the tracks to the library.
 * For playlists files, not implemented.
 */
fn handle_file_associations(app_handle: AppHandle, mut files: Vec<PathBuf>) {
    info!("Handling file(s) opening: {:#?}", files);

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
        .collect::<Vec<_>>();

    let window = app_handle.get_webview_window("main");

    if window.is_none() {
        return;
    }

    info!(
        "Sending a queue of {} track(s) to be played to the UI",
        queue.len()
    );

    match window
        .unwrap()
        .emit(IPCEvent::PlaybackStart.as_ref(), queue)
    {
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
