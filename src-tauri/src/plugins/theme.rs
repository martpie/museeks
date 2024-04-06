use log::info;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, Runtime, WindowEvent};

use crate::libs::events::IPCEvent;

pub const SYSTEM_THEME_ID: &str = "__system";

/**
 * This plugin listens to system-wide theme changes and update the window
 * theme accordingly + do the same based on potential user overrides of the
 * theme setting.
 */
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("theme")
        .on_window_ready(|win| {
            // Weird, should "win" be a reference instead maybe?
            let window = win.clone();

            win.on_window_event(move |event| match event {
                WindowEvent::ThemeChanged(theme) => {
                    let theme_id = match theme {
                        tauri::Theme::Light => "light",
                        tauri::Theme::Dark => "dark",
                        _ => unreachable!(),
                    };

                    // TODO check from the config if the theme is set to system
                    // otherwise, we should not update the theme
                    info!("System theme has changed to {:?}", theme);
                    window
                        .emit(IPCEvent::ThemeUpdate.as_ref(), theme_id)
                        .unwrap();
                }
                _ => {}
            })
        })
        .build()
}
