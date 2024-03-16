// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod libs;
mod plugins;

use libs::utils::show_window;
use log::LevelFilter;
use tauri::Manager;
use tauri_plugin_log::fern::colors::ColoredLevelConfig;
use tauri_plugin_log::{Target, TargetKind};

/**
 * The beast
 */
#[tokio::main]
async fn main() {
    // Is there any way to instantiate that in the plugin directly?
    let db = plugins::database::setup().await.ok().unwrap();

    tauri::Builder::default()
        // Logging must be setup first, otherwise the logs won't be captured
        // while setting up the other plugins.
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::Webview),
                ])
                .level(LevelFilter::Info)
                .with_colors(ColoredLevelConfig::default())
                .build(),
        )
        // Custom integrations
        .plugin(plugins::app_menu::init())
        .plugin(plugins::config::init())
        .plugin(plugins::cover::init())
        .plugin(plugins::database::init(db))
        .plugin(plugins::debug::init())
        .plugin(plugins::default_view::init())
        .plugin(plugins::shell_extension::init())
        .plugin(plugins::sleepblocker::init())
        .plugin(plugins::macos::init())
        // Tauri integrations with the Operating System
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_single_instance::init(|app_handle, _, _| {
            let window = app_handle.get_webview_window("main").unwrap();
            show_window(&window);
        }))
        .plugin(tauri_plugin_window_state::Builder::default().build())
        // TODO: tauri-plugin-theme to update the native theme at runtime
        .setup(|_app| {
            // :]
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
