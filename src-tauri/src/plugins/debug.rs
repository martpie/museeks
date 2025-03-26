use tauri::Runtime;
use tauri::plugin::{Builder, TauriPlugin};

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("debug")
        .on_webview_ready(|webview| {
            #[cfg(dev)]
            {
                webview.open_devtools();
            }

            #[cfg(not(dev))]
            drop(webview);
        })
        .build()
}
