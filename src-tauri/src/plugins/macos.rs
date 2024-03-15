use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, Runtime};

/**
 * Plugin in charge on making sure closing the app does not stop the audio
 */
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("sleepblocker")
        .on_window_ready(|win| {
            // Prevent macOS to kill the player when closing the main window. Instead,
            // the window should be hidden and re-shown when invoking it again.
            #[cfg(target_os = "macos")]
            {
                // Weird, should "win" be a reference instead maybe?
                let window = win.clone();

                win.on_window_event(move |event| match event {
                    tauri::WindowEvent::CloseRequested { api, .. } => {
                        window.app_handle().hide().unwrap();
                        api.prevent_close();
                    }
                    _ => {}
                });
            }
        })
        .build()
}
