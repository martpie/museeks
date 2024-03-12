use log::info;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, Runtime, State};

use crate::libs::error::AnyResult;
use crate::plugins::config::{ConfigManager, DefaultView};

#[tauri::command]
pub fn set(config_manager: State<ConfigManager>, default_view: DefaultView) -> AnyResult<()> {
    info!("Default view set to '{:?}'", default_view);
    config_manager.set_default_view(default_view);
    Ok(())
}

/**
 * Set the default view on application load based on user preference
 */
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("default-view")
        .invoke_handler(tauri::generate_handler![set])
        .on_webview_ready(|mut window| {
            if window.label().eq("main") {
                let config_manager = window.state::<ConfigManager>();
                let mut url = window.url();
                let default_view = config_manager.get().default_view;

                let fragment = match default_view {
                    DefaultView::Library => "/library",
                    DefaultView::Playlists => "/playlists",
                };

                info!("Navigating to '{}'", fragment);
                url.set_fragment(Some(fragment));
                window.navigate(url);
            }
        })
        .build()
}
