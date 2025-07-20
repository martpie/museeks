use std::path::PathBuf;

use tauri::plugin::{Builder, TauriPlugin};

/**
 * Plugin in charge of handle file associations.
 * It's convoluted due to x-platform issues.
 *
 * On Windows, the files are passed as command line arguments, without any prefix:
 * - C:\\users\\someone\\music\\song.mp3
 * On Linux, the files can be passed as command line arguments, like:
 * - /home/someone/music/song.mp3
 * - file:///home/someone/music/song.mp3
 * On macOS, they are passed via the RunEvent::Opened event, as a list of URLs
 *
 * Test on windows dev mode with:
 * npm run tauri dev -- -- "G:\Mon Drive\Music\Air\Love 2\03 So Light Is Her Footfall.mp3" "G:\Mon Drive\Music\Air\Love 2\08 Night Hunter.mp3"
 * (replace by your own files)
 */
use tauri::{AppHandle, Emitter, Manager, Runtime};
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};

use crate::libs::error::AnyResult;
use crate::libs::events::IPCEvent;
use crate::libs::track::{Track, get_tracks_from_paths};

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    // This happens only at startup, so this does not support opening files
    // after the app has started.
    // Once the app is started, the tauri_plugin_single_instance plugin is in
    // charge of handling opened files.
    let args = std::env::args().collect();

    println!(
        "[file_associations] Handling opened files at startup: {:?}",
        &args
    );

    let tracks = get_tracks_from_args(args);

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

pub fn get_tracks_from_args(args: Vec<String>) -> Option<Vec<Track>> {
    let stripped_from_executable = args.into_iter().skip(1);

    let mut paths = vec![];

    // NOTICE: `args` may include URL protocol (`your-app-protocol://`)
    // or arguments (`--`) if your app supports them.
    // files may also be passed as `file://path/to/file`
    for maybe_file in stripped_from_executable {
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
                    println!(
                        "[file_associations] Failed to canonicalize path {:?}: {:?}",
                        maybe_file, err
                    );
                    continue;
                }
            };

            paths.push(path);
        }
        // Handle classic /path/to/file, like on Linux
        else {
            let path = match PathBuf::from(&maybe_file).canonicalize() {
                Ok(path) => path,
                Err(err) => {
                    println!(
                        "[file_associations] Invalid argument {:?}: {:?}",
                        maybe_file, err
                    );
                    continue;
                }
            };

            paths.push(path);
        }
    }

    println!("[file_associations] Found those valid paths: {:?}", &paths);

    match paths.is_empty() {
        true => None,
        false => Some(get_valid_tracks_and_report_errors(get_tracks_from_paths(
            paths,
        ))),
    }
}

/**
 * Given a scan result (a vec of tracks and potential errors), log errors, warn
 * user and return only the valid tracks.
 */
pub fn get_valid_tracks_and_report_errors(tracks: Vec<AnyResult<Track>>) -> Vec<Track> {
    let mut valid_tracks = vec![];
    for track in tracks {
        match track {
            Ok(track) => valid_tracks.push(track),
            Err(err) => {
                // TODO: display errors to users, somehow, via app_handle.dialog()
                println!("[file_associations] Error processing track: {:?}", err);
            }
        }
    }
    valid_tracks
}

/**
 * Handle opened files from command line arguments. Used when the app is already
 * running.
 */
pub fn handle_opened_files(app_handle: &AppHandle, args: Vec<String>) {
    println!(
        "[file_associations] Handling opened files from command line arguments: {:?}",
        &args
    );
    let tracks = get_tracks_from_args(args);

    send_queue_to_ui(app_handle, tracks);
}

/**
 * Given a RunEvent, send the potential queue to the UI.
 * This is only used on macOS, as it has the RunEvent::Opened event
 */
#[cfg(target_os = "macos")]
pub fn handle_run_event(app_handle: &AppHandle, event: tauri::RunEvent) {
    if let tauri::RunEvent::Opened { urls } = event {
        let paths = urls
            .into_iter()
            .filter_map(|url| url.to_file_path().ok())
            .collect::<Vec<_>>();

        let tracks = get_valid_tracks_and_report_errors(get_tracks_from_paths(paths));

        send_queue_to_ui(app_handle, Some(tracks));
    }
}

/**
 * Handle the app file association.
 * For audio files, it will scan the files, create a queue and play it, *without* adding the tracks to the library.
 * For playlists files, not implemented.
 */
fn send_queue_to_ui(app_handle: &AppHandle, maybe_tracks: Option<Vec<Track>>) {
    if maybe_tracks.is_none() {
        println!("[file_associations] No tracks found in opened files, do nothing");
        return;
    }

    let tracks = maybe_tracks.unwrap();
    println!(
        "[file_associations] Sending queue to UI: {:?}",
        &tracks.iter().map(|t| t.path.clone()).collect::<Vec<_>>()
    );

    // This is for the `asset:` protocol to work, ensuring access to the files
    let asset_protocol_scope = app_handle.asset_protocol_scope();

    for track in &tracks {
        let _ = asset_protocol_scope.allow_file(&track.path);
    }

    // Send the queue to the UI for it to play the tracks
    let window = app_handle.get_webview_window("main");

    match window {
        Some(window) => {
            match window.emit(IPCEvent::PlaybackStart.as_ref(), tracks) {
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
            println!("[file_associations] Main window not created, cannot open the files...");
        }
    }
}
