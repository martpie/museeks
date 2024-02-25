// use tauri::menu::{AboutMetadataBuilder, MenuBuilder, SubmenuBuilder};
use tauri::plugin::{Builder, TauriPlugin};
use tauri::Runtime;

// const APP_NAME: &str = "Museeks"; // TODO use app.package instead

// fn get_initial_menu() -> MenuBuilder {
// let menu = Menu::with_items([
//     Submenu::new("USELESS", Menu::new()).into(),
//     Submenu::new(
//         APP_NAME,
//         Menu::new()
//             .add_native_item(MenuItem::About(String::from(APP_NAME), about_metadata))
//             .add_native_item(MenuItem::Separator)
//             .add_native_item(MenuItem::Services)
//             .add_native_item(MenuItem::Separator)
//             .add_native_item(MenuItem::Hide)
//             .add_native_item(MenuItem::HideOthers)
//             .add_native_item(MenuItem::ShowAll)
//             .add_native_item(MenuItem::Separator)
//             .add_native_item(MenuItem::Quit),
//     )
//     .into(),
//     Submenu::new("File", Menu::new().add_native_item(MenuItem::CloseWindow)).into(),
//     Submenu::new(
//         "Edit",
//         Menu::new()
//             .add_native_item(MenuItem::Undo)
//             .add_native_item(MenuItem::Redo)
//             .add_native_item(MenuItem::Separator)
//             .add_native_item(MenuItem::Cut)
//             .add_native_item(MenuItem::Copy)
//             .add_native_item(MenuItem::Paste)
//             .add_native_item(MenuItem::SelectAll),
//     )
//     .into(),
//     Submenu::new(
//         "View",
//         Menu::new()
//             // TODO:
//             // - jump to track
//             // - separator
//             // - go to library
//             // - go to playlists
//             // - separator
//             // - reload
//             // - force reload
//             // - toggle developer tools
//             // - separator
//             // - actual size
//             // - zoom in
//             // - zoom out
//             // - actual
//             .add_native_item(MenuItem::EnterFullScreen),
//     )
//     .into(),
//     Submenu::new(
//         "Window",
//         Menu::new()
//             .add_native_item(MenuItem::Minimize)
//             .add_native_item(MenuItem::Zoom),
//     )
//     .into(),
//     Submenu::new("Help", Menu::new()).into(),
// ]);

//     return menu;
// }

/**
 * The actual plugin
 */
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("global_menu")
        .on_window_ready(|_window| {
            // TODO: not working
            // let handle = window.app_handle();

            // let about_metadata = AboutMetadataBuilder::new()
            //     .version("0.20.0".into()) // TODO: Automate all that?
            //     .authors(Some(vec!["Pierre de la Martinière".to_owned()]))
            //     .license("MIT".into())
            //     .website("https://museeks.io".into())
            //     .website_label("website".into())
            //     .build();

            // let app_menu = SubmenuBuilder::new(handle, "Test")
            //     .about(Some(about_metadata))
            //     .build()
            //     .unwrap();

            // let menu = MenuBuilder::new(handle).item(&app_menu).build().unwrap();

            // window.set_menu(menu).unwrap();
        })
        .build()
}
