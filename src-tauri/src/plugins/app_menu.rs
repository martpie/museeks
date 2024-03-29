use std::path::PathBuf;
use tauri::image::Image;
use tauri::{
    menu::{AboutMetadataBuilder, MenuBuilder, MenuId, MenuItemBuilder, SubmenuBuilder},
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

use crate::libs::error::AnyResult;
use crate::libs::events::IPCEvent;

#[tauri::command]
pub async fn toggle<R: Runtime>(window: tauri::Window<R>) -> AnyResult<()> {
    // On macOS, the menu is global, and thus does not need to be toggled
    #[cfg(not(target_os = "macos"))]
    {
        match window.is_menu_visible() {
            Ok(true) => {
                window.hide_menu()?;
            }
            Ok(false) => {
                window.show_menu()?;
            }
            _ => (),
        }
    }

    #[cfg(target_os = "macos")]
    drop(window); // Suppress warning about unused variable.

    Ok(())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("app-menu")
        .invoke_handler(tauri::generate_handler![toggle])
        .on_window_ready(|window| {
            let app_handle = window.app_handle();

            // -----------------------------------------------------------------
            // Museeks sub-menu
            // -----------------------------------------------------------------
            let package_info = app_handle.package_info();
            let version = package_info.version.to_string().into();
            let resource_path: PathBuf = app_handle.path().resource_dir().unwrap();
            let icon_path = resource_path.join("icons").join("icon.png");
            let icon = Image::from_path(icon_path).unwrap();

            let about_metadata = AboutMetadataBuilder::new()
                .version(version) // TODO: Automate all that?
                .authors(Some(vec![package_info.authors.to_string()]))
                .license("MIT".into())
                .website("https://museeks.io".into())
                .website_label("museeks.io".into())
                .icon(Some(icon))
                .build();

            let museeks_menu = SubmenuBuilder::new(app_handle, "Museeks")
                .about(Some(about_metadata))
                .separator()
                .services()
                .hide()
                .hide_others()
                .show_all()
                .separator()
                .quit()
                .build()
                .unwrap();

            // -----------------------------------------------------------------
            // File sub-menu
            // -----------------------------------------------------------------
            let file_menu = SubmenuBuilder::new(app_handle, "File")
                .close_window()
                .build()
                .unwrap();

            // -----------------------------------------------------------------
            // Edit sub-menu
            // -----------------------------------------------------------------
            let edit_menu = SubmenuBuilder::new(app_handle, "Edit")
                .undo()
                .redo()
                .separator()
                .cut()
                .copy()
                .paste()
                .select_all()
                .build()
                .unwrap();

            // -----------------------------------------------------------------
            // View sub-menu
            // -----------------------------------------------------------------
            // TODO: create events listeners and shortcuts
            let view_menu = SubmenuBuilder::new(app_handle, "View")
                .item(
                    &MenuItemBuilder::new("Jump to playing track")
                        .id(MenuId::new("jump_to_playing_track"))
                        .accelerator("CmdOrCtrl+T")
                        .build(app_handle)
                        .unwrap(),
                )
                .separator()
                .item(
                    &MenuItemBuilder::new("Go to library")
                        .id(MenuId::new(IPCEvent::GoToLibrary.as_ref()))
                        .accelerator("CmdOrCtrl+L")
                        .build(app_handle)
                        .unwrap(),
                )
                .item(
                    &MenuItemBuilder::new("Go to playlists")
                        .id(MenuId::new(IPCEvent::GoToPlaylists.as_ref()))
                        .accelerator("CmdOrCtrl+P")
                        .build(app_handle)
                        .unwrap(),
                )
                .item(
                    &MenuItemBuilder::new("Go to settings")
                        .id(MenuId::new(IPCEvent::GoToSettings.as_ref()))
                        .accelerator("CmdOrCtrl+P")
                        .build(app_handle)
                        .unwrap(),
                )
                .build()
                .unwrap();

            // -----------------------------------------------------------------
            // Window sub-menu
            // -----------------------------------------------------------------
            let window_menu: tauri::menu::Submenu<R> = SubmenuBuilder::new(app_handle, "Window")
                .item(
                    &MenuItemBuilder::new("-")
                        .enabled(false)
                        .build(app_handle)
                        .unwrap(),
                )
                .build()
                .unwrap();

            // -----------------------------------------------------------------
            // Help sub-menu
            // -----------------------------------------------------------------
            let help_menu = SubmenuBuilder::new(app_handle, "Help")
                .item(
                    &MenuItemBuilder::new("-")
                        .enabled(false)
                        .build(app_handle)
                        .unwrap(),
                )
                .build()
                .unwrap();

            // -----------------------------------------------------------------
            // Assembled menu + listeners
            // -----------------------------------------------------------------
            let menu = MenuBuilder::new(app_handle)
                .items(&[
                    &museeks_menu,
                    &file_menu,
                    &edit_menu,
                    &view_menu,
                    &window_menu,
                    &help_menu,
                ])
                .build()
                .unwrap();

            // The menu on macOS is app-wide and not specific to one window
            #[cfg(target_os = "macos")]
            {
                app_handle.set_menu(menu).unwrap();
            }

            // On Windows / Linux, app menus are wasting vertical space, so we
            // hide it by default. The menu get toggle-able by pressing Alt.
            #[cfg(not(target_os = "macos"))]
            {
                window.set_menu(menu).unwrap();
                window.hide_menu().unwrap();
            }

            // TODO: support menu events
            // https://github.com/tauri-apps/tauri/issues/9060
            // window.on_menu_event(|_app_handle, event| {
            //     // let main_webview = app_handle.get_webview_window("main").unwrap();

            //     info!("event {:?}", event.id());
            //     // TODO:
            //     // main_webview.emit();
            // });
        })
        .build()
}
