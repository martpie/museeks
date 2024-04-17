use log::info;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime, Theme, Window,
};
use windows_sys::Win32::Graphics::Dwm::{DwmSetWindowAttribute, DWMWA_USE_IMMERSIVE_DARK_MODE};

use crate::libs::error::AnyResult;

#[tauri::command]
pub fn set_window_theme<R: Runtime>(window: Window<R>, dark: bool) -> AnyResult<()> {
    info!("set theme {:?}", &dark);
    unsafe {
        let handle = window.hwnd().unwrap().0;
        // let value: bool = if theme == Theme::Dark { true } else { false };
        let attribute = DWMWA_USE_IMMERSIVE_DARK_MODE;
        DwmSetWindowAttribute(
            handle,
            attribute as u32,
            &dark as *const _ as *const _,
            std::mem::size_of::<bool>() as u32,
        );
    }

    Ok(())
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
