use log::info;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Runtime, State, Theme};

use crate::libs::error::AnyResult;
use crate::plugins::config::ConfigManager;

pub const SYSTEM_THEME: &str = "__system";

#[tauri::command]
pub fn set_theme<R: Runtime>(
    window: tauri::Window<R>,
    config_manager: State<ConfigManager>,
    theme: String,
) -> AnyResult<String> {
    match theme.as_str() {
        "light" => {
            window.set_theme(Some(Theme::Light))?;
        }
        "dark" => {
            window.set_theme(Some(Theme::Dark))?;
        }
        _ => {
            window.set_theme(None)?;
        }
    }

    config_manager.set_theme(theme.clone())?;

    let window_theme = window.theme()?;
    Ok(get_theme_from_tauri_theme(&window_theme))
}

fn get_theme_from_tauri_theme(theme: &Theme) -> String {
    match theme {
        Theme::Light => "light".into(),
        Theme::Dark => "dark".into(),
        _ => {
            info!("Unknown theme requested");
            "light".into()
        }
    }
}

pub fn get_tauri_theme_from_theme(theme_name: &str) -> Option<Theme> {
    match theme_name {
        "light" => Some(Theme::Light),
        "dark" => Some(Theme::Dark),
        SYSTEM_THEME => None,
        _ => None, // ? :]
    }
}

/**
 * Plugin in charge of theming the window + the webview content.
 *
 * Tauri's support for theming API is better since RC12, but not perfect yet (app.set_theme is crashing on macOS, listening
 * to theme change does not work (at least not as expected, etc). This pluging tries to solve some of those issues.
 *
 * TLDR:
 * 1. theme update from the UI -> set_theme command invocation -> update window theme -> tell the UI which theme to apply
 * 2. theme is set to __system, system-wide setting changes -> tell the UI which theme to Apply
 */
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("theme")
        .invoke_handler(tauri::generate_handler![set_theme])
        .build()
}
