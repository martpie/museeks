use log::info;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::webview::PageLoadEvent;
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
        .on_page_load(|webview, payload| {
            if webview.label().eq("main") && payload.event() == PageLoadEvent::Finished {
                let config_manager = webview.state::<ConfigManager>();
                let mut url = payload.url().clone();
                let default_view = config_manager.get().default_view;

                let fragment = match default_view {
                    DefaultView::Library => "/library",
                    DefaultView::Playlists => "/playlists",
                };

                info!("Navigating to '{}'", fragment);
                url.set_fragment(Some(fragment));

                // For some reasons, it does not seem possible to navigate directly
                // from the webview argument, as we cannot make it &mut
                webview
                    .app_handle()
                    .get_webview_window("main")
                    .unwrap()
                    .navigate(url)
            }
        })
        .build()
}
