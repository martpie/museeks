/**
 * Plugin in charge of handle file associations.
 * It's convoluted due to x-platform issues.
 */
use tauri::Runtime;
use tauri::plugin::{Builder, TauriPlugin};

use crate::libs::track::Track;

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    let args: Vec<String> = std::env::args().collect();
    println!("Arguments: {:?}", args);

    let tracks: Vec<Track> = vec![]; // TODO: get tracks from args, basically set_file_associations

    // We need to inject the initial state of the config to the window object of
    // our webview, because some of our front-end modules are instantiated at
    // parsing time and require data that would otherwise only load-able asynchronously
    let initial_queue_script: String = format!(
        r#"
            window.__MUSEEKS_INITIAL_QUEUE = {:?};
        "#,
        serde_json::to_string(&tracks).expect("Failed to serialize tracks for the initial queue"),
    );

    Builder::<R>::new("file_associations")
        .js_init_script(initial_queue_script)
        .build()
}
