use log::info;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Runtime, WindowEvent};

/**
 * Plugin in charge on making sure closing the app does not stop the audio
 */
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("sleepblocker")
        .on_window_ready(|win| {
            let window = win.clone();

            // Prevent macOS to kill the player when closing the main window. Instead,
            // the window should be hidden and re-shown when invoking it again.
            #[cfg(target_os = "macos")]
            win.on_window_event(move |event| match event {
                // TODO: active event?
                WindowEvent::CloseRequested { api, .. } => {
                    info!("Preventing window to close, hiding it instead");
                    api.prevent_close();
                    window.hide().unwrap();
                }
                &_ => {}
            });

            ()
        })
        .build()
}
