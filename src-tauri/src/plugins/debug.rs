use tauri::plugin::{Builder, TauriPlugin};
use tauri::Runtime;

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("debug")
        .on_webview_ready(|window| {
            #[cfg(dev)]
            {
                window.open_devtools();
            }

            #[cfg(not(dev))]
            drop(window);
        })
        .build()
}
