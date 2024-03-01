use log::info;
use serde::{Deserialize, Serialize};
use std::any::Any;
use std::fmt::{Display, Formatter, Result};
use std::path::PathBuf;
use tauri::{
    menu::{AboutMetadataBuilder, MenuBuilder, MenuId, MenuItemBuilder, SubmenuBuilder},
    plugin::{Builder, TauriPlugin},
    Icon, Manager, Runtime,
};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export, export_to = "../src/generated/typings/AppMenuEvent.ts")]
pub enum AppMenuEvent {
    JumpToPlayingTrack,
    GoToLibrary,
    GoToPlaylists,
}

impl Display for AppMenuEvent {
    fn fmt(&self, f: &mut Formatter) -> Result {
        match self {
            AppMenuEvent::JumpToPlayingTrack => {
                write!(f, "JumpToPlayingTrack")
            }
            AppMenuEvent::GoToLibrary => {
                write!(f, "GoToLibrary")
            }
            AppMenuEvent::GoToPlaylists => {
                write!(f, "GoToPlaylists")
            }
        }
    }
}

// #[cfg(not(target_os = "macos"))]
// #[command]
// pub fn toggle<R: tauri::Runtime>(window: tauri::Window<R>) {
//     if window.is_menu_visible().unwrap_or_default() {
//         let _ = window.hide_menu();
//     } else {
//         let _ = window.show_menu();
//     }
// }

// #[cfg(target_os = "macos")]
// pub struct AppMenu<R: Runtime>(pub std::sync::Mutex<Option<tauri::menu::Menu<R>>>);

// pub struct PopupMenu<R: Runtime>(tauri::menu::Menu<R>);

// #[cfg(target_os = "macos")]
// #[command]
// pub fn toggle<R: tauri::Runtime>(
//     app: tauri::AppHandle<R>,
//     app_menu: tauri::State<'_, crate::AppMenu<R>>,
// ) {
//     if let Some(menu) = app.remove_menu().unwrap() {
//         app_menu.0.lock().unwrap().replace(menu);
//     } else {
//         app.set_menu(app_menu.0.lock().unwrap().clone().expect("no app menu"))
//             .unwrap();
//     }
// }

// #[command]
// pub fn popup<R: tauri::Runtime>(
//     window: tauri::Window<R>,
//     popup_menu: tauri::State<'_, crate::PopupMenu<R>>,
// ) {
//     window.popup_menu(&popup_menu.0).unwrap();
// }

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("app-menu")
        .invoke_handler(tauri::generate_handler![/*popup, toggle*/])
        .setup(|app_handle, _api| {
            // -----------------------------------------------------------------
            // Museeks sub-menu
            // -----------------------------------------------------------------
            let package_info = app_handle.package_info();
            let version = package_info.version.to_string().into();
            let resource_path: PathBuf = app_handle.path().resource_dir().unwrap();
            let icon_path = resource_path // Why is it the debug folder?
                .join("..")
                .join("..")
                .join("icons")
                .join("icon.png");
            let icon = Icon::File(icon_path);

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
                        .id(MenuId::new("go_to_library"))
                        .accelerator("CmdOrCtrl+L")
                        .build(app_handle)
                        .unwrap(),
                )
                .item(
                    &MenuItemBuilder::new("Go to playlists")
                        .id(MenuId::new("go_to_playlists"))
                        .accelerator("CmdOrCtrl+P")
                        .build(app_handle)
                        .unwrap(),
                )
                .separator()
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

            app_handle.set_menu(menu).unwrap();

            app_handle.on_menu_event(|_app_handle: &tauri::AppHandle<R>, event| {
                // let main_webview = app_handle.get_webview_window("main").unwrap();

                info!("event {:?} {:?}", event.id(), event.type_id());
                // TODO:
                // main_webview.emit();
            });

            // #[cfg(target_os = "macos")]
            // app_handle.manage(AppMenu::<R>(Default::default()));

            // app_handle.manage(PopupMenu(
            //     tauri::menu::MenuBuilder::new(app)
            //         .check("check", "Tauri is awesome!")
            //         .text("text", "Do something")
            //         .copy()
            //         .build()?,
            // ));

            Ok(())
        })
        .build()
}
