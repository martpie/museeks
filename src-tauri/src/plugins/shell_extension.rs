// Stolen and adapted from https://github.com/tauri-apps/plugins-workspace/issues/999
// TODO: make sure it works on Windows and Linux

use std::process::Command;

#[cfg(not(target_os = "windows"))]
use std::path::PathBuf;

use tauri::plugin::{Builder, TauriPlugin};
use tauri::{generate_handler, Runtime};

#[cfg(target_os = "linux")]
use {
    std::sync::Mutex,
    std::time::Duration,
    tauri::{Manager, State},
};

/**
 * Show item in folder for Linux, using dbus
 */
#[cfg(target_os = "linux")]
#[tauri::command]
pub fn show_item_in_folder(path: String, dbus_state: State<DbusState>) -> Result<(), String> {
    let dbus_guard = dbus_state.0.lock().map_err(|e| e.to_string())?;

    // see https://gitlab.freedesktop.org/dbus/dbus/-/issues/76
    if dbus_guard.is_none() || path.contains(",") {
        let mut path_buf = PathBuf::from(&path);
        let new_path = match path_buf.is_dir() {
            true => path,
            false => {
                path_buf.pop();
                path_buf.into_os_string().into_string().unwrap()
            }
        };
        Command::new("xdg-open")
            .arg(&new_path)
            .spawn()
            .map_err(|e| format!("{e:?}"))?;
    } else {
        // https://docs.rs/dbus/latest/dbus/
        let dbus = dbus_guard.as_ref().unwrap();
        let proxy = dbus.with_proxy(
            "org.freedesktop.FileManager1",
            "/org/freedesktop/FileManager1",
            Duration::from_secs(5),
        );
        let (_,): (bool,) = proxy
            .method_call(
                "org.freedesktop.FileManager1",
                "ShowItems",
                (vec![format!("file://{path}")], ""),
            )
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

/**
 * Show item in folder
 * - for macOS, using Finder
 * - for Windows, using Explorer
 */
#[cfg(not(target_os = "linux"))]
#[tauri::command]
pub fn show_item_in_folder(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .args(["/select,", &path]) // The comma after select is not a typo
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "macos")]
    {
        let path_buf = PathBuf::from(&path);
        if path_buf.is_dir() {
            Command::new("open")
                .args([&path])
                .spawn()
                .map_err(|e| e.to_string())?;
        } else {
            Command::new("open")
                .args(["-R", &path])
                .spawn()
                .map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[cfg(target_os = "linux")]
pub struct DbusState(Mutex<Option<dbus::blocking::SyncConnection>>);

/**
 * Plugin in charge of adding shell-related extended features
 */
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("shell-extension")
        .invoke_handler(generate_handler![show_item_in_folder])
        .setup(|_app_handle, _| {
            #[cfg(target_os = "linux")]
            _app_handle.manage(DbusState(Mutex::new(
                dbus::blocking::SyncConnection::new_session().ok(),
            )));

            Ok(())
        })
        .build()
}
