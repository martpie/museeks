use std::path::PathBuf;

use log::{info, warn};
use tauri::plugin::{Builder, TauriPlugin};
/**
 * Plugin in charge of handle file associations.
 * It's convoluted due to x-platform issues.
 *
 * On Windows, the files are passed as command line arguments, without any prefix:
 * - C:\\users\\someone\\music\\song.mp3
 * On Linux, check that everything works (TODO)
 * On macOS, they are passed via the RunEvent::Opened event, as a list of URLs (TODO)
 *
 * Test on dev mode with
 * npm run tauri dev -- -- "G:\Mon Drive\Music\Air\Love 2\03 So Light Is Her Footfall.mp3" "G:\Mon Drive\Music\Air\Love 2\08 Night Hunter.mp3"
 * (replace by your own files)
 */
use tauri::{AppHandle, Manager, Runtime};

use crate::libs::track::{Track, get_tracks_from_paths};

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    // This happens only at startup, so this does not support opening files
    // after the app has started.
    let args = std::env::args().skip(1);
    let mut paths = vec![];

    // NOTICE: `args` may include URL protocol (`your-app-protocol://`)
    // or arguments (`--`) if your app supports them.
    // files may also be passed as `file://path/to/file`
    for maybe_file in args {
        // skip flags like -f or --flag
        if maybe_file.starts_with("-") {
            continue;
        }

        // handle `file://` path urls and other C:\... paths
        if let Ok(_) = tauri::Url::parse(&maybe_file) {
            // We cannot use `Url::to_file_path` here, because it will fail on
            // Windows as it does not provide UNC
            // https://github.com/servo/rust-url/issues/450

            let path = match PathBuf::from(&maybe_file).canonicalize() {
                Ok(path) => path,
                Err(err) => {
                    warn!(
                        "[file_associations] Failed to canonicalize path {:?}: {:?}",
                        maybe_file, err
                    );
                    continue;
                }
            };

            paths.push(path);
        }
    }

    if !paths.is_empty() {
        info!("Found file associations: {:?}", paths);
    }

    let tracks: Vec<Track> = get_tracks_from_paths(paths);

    let serialized_tracks =
        serde_json::to_string(&tracks).expect("Failed to serialize tracks for the initial queue");

    // We need to inject the initial state of the config to the window object of
    // our webview, because some of our front-end modules are instantiated at
    // parsing time and require data that would otherwise only load-able asynchronously
    let initial_queue_script: String = format!(
        r#"
            window.__MUSEEKS_INITIAL_QUEUE = {};
        "#,
        serialized_tracks,
    );

    Builder::<R>::new("file_associations")
        .js_init_script(initial_queue_script)
        .build()
}

/** ----------------------------------------------------------------------------
 * Other Helpers
 * -------------------------------------------------------------------------- */

/**
 * Given a RunEvent, send the potential queue to the UI.
 * This is only used on macOS, as it has the RunEvent::Opened event
 */
#[cfg(target_os = "macos")]
pub fn handle_opened_file(app_handle: &AppHandle, event: tauri::RunEvent) {
    if let tauri::RunEvent::Opened { urls } = event {
        let files = urls
            .into_iter()
            .filter_map(|url| url.to_file_path().ok())
            .collect::<Vec<_>>();

        send_queue_to_ui(app_handle.clone(), files);
    }
}

/**
 * Handle the app file association.
 * For audio files, it will scan the files, create a queue and play it, *without* adding the tracks to the library.
 * For playlists files, not implemented.
 *
 * TODO: make this work on Windows and Linux, as they don't have RunEvent::Opened.
 * Maybe tauri_plugin_single_instance can help? Otherwise leverage
 */
#[cfg(target_os = "macos")]
fn send_queue_to_ui(app_handle: AppHandle, files: Vec<PathBuf>) {
    info!("Handling the opening of the following files:");
    for file in &files {
        info!("  - {:?}", file)
    }

    ensure_file_access(&files, &app_handle);

    let queue = get_tracks_from_paths(files);

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

#[allow(dead_code)]
fn ensure_file_access(files: &Vec<PathBuf>, app_handle: &AppHandle) {
    // This is for the `asset:` protocol to work, ensuring access to the files
    let asset_protocol_scope = app_handle.asset_protocol_scope();

    for file in files {
        let _ = asset_protocol_scope.allow_file(file);
    }
}
