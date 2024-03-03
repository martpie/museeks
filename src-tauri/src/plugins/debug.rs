use tauri::plugin::{Builder, TauriPlugin};
use tauri::Runtime;

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("debug")
        .on_webview_ready(|window| {
            #[cfg(debug_assertions)]
            {
                window.open_devtools();
            }
        })
        .build()
}
