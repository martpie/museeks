// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod constants;
mod libs;
mod plugins;

use std::path::PathBuf;

use log::{info, LevelFilter};
use tauri::{Icon, Manager};
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
        .setup(|app| {
            let resource_path: PathBuf = app.path().resource_dir().unwrap();
            let p = resource_path
                .join("..")
                .join("..")
                .join("icons")
                .join("icon.png")
                .to_owned();
            info!("{:?}", p);

            let icon = Icon::File(p);
            info!("{:?}", icon);
            // let mut a = app.path().app_cache_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);
            // a = app.path().app_config_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // a = app.path().app_data_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // a = app.path().app_local_data_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // a = app.path().app_log_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // a = app.path().audio_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // a = app.path().cache_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // a = app.path().config_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // a = app.path().data_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // a = app.path().desktop_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // a = app.path().document_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // a = app.path().download_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // a = app.path().executable_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // a = app.path().font_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // a = app.path().home_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // a = app.path().local_data_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // // a = app.path().parse().unwrap_or(PathBuf::new());
            // a = app.path().picture_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // a = app.path().public_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // // a = app.path().resolve().unwrap_or(PathBuf::new());
            // a = app.path().resource_dir().unwrap_or(PathBuf::new());
            // info!("resource {:?}", a);

            // a = app.path().runtime_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // a = app.path().temp_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // a = app.path().template_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            // a = app.path().video_dir().unwrap_or(PathBuf::new());
            // info!("{:?}", a);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
