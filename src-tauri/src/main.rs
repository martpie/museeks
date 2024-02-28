// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod constants;
mod libs;
mod plugins;

use log::LevelFilter;
use tauri_plugin_log::fern::colors::ColoredLevelConfig;
use tauri_plugin_log::{Target, TargetKind};
use tauri_plugin_shell;

/**
 * The beast
 */
#[tokio::main]
async fn main() {
    // Is there any way to instantiate that in the plugin directly?
    let db = plugins::database::setup().await.ok().unwrap();

    tauri::Builder::default()
        // Custom integrations
        .plugin(plugins::app_menu::init())
        .plugin(plugins::config::init())
        .plugin(plugins::database::init(db))
        .plugin(plugins::debug::init())
        .plugin(plugins::default_view::init())
        .plugin(plugins::sleepblocker::init())
        // Tauri integrations with the Operating System
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
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
        // TODO: single instance
        // TODO: tauri-plugin-theme
        .setup(|_app| {
            // :]
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
