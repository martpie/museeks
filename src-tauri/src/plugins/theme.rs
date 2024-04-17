use log::info;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime, Theme, WebviewWindow, Window,
};
use windows_sys::Win32::Foundation::*;
use windows_sys::Win32::Graphics::Dwm::*;

#[tauri::command]
fn set_window_theme<R: Runtime>(window: WebviewWindow<R>, theme: &str) {
    if theme == "dark" {
        set_w_theme(&window, Theme::Dark);
    } else {
        set_w_theme(&window, Theme::Light);
    }
}
// pub fn set_window_theme<R: Runtime>(window: Window<R>, dark: bool) -> AnyResult<()> {
//     info!("set theme {:?}", &dark);
//     unsafe {
//         let handle = window.hwnd().unwrap().0;
//         // let value: bool = if theme == Theme::Dark { true } else { false };
//         let attribute = DWMWA_USE_IMMERSIVE_DARK_MODE;
//         DwmSetWindowAttribute(
//             handle,
//             attribute as u32,
//             &dark as *const _ as *const _,
//             std::mem::size_of::<bool>() as u32,
//         );
//     }

//     Ok(())
// }

pub fn set_w_theme<R: Runtime>(window: &WebviewWindow<R>, theme: Theme) {
    info!("set theme {:?}", theme);
    unsafe {
        let handle = window.hwnd().unwrap().0;
        let value: BOOL = if theme == Theme::Dark { 1 } else { 0 };
        let attribute = DWMWA_USE_IMMERSIVE_DARK_MODE;
        DwmSetWindowAttribute(
            handle,
            attribute as u32,
            &value as *const _ as *const _,
            std::mem::size_of::<BOOL>() as u32,
        );
    }
}

/**
 * Plugin in charge of preventing the app from going to sleep
 */
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("theme")
        .invoke_handler(tauri::generate_handler![set_window_theme])
        .setup(|app_handle, _api| Ok(()))
        .build()
}
