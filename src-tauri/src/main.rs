// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod libs;
mod plugins;

use log::LevelFilter;
use plugins::config::ConfigManager;
use tauri::Manager;
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
        .plugin(plugins::cover::init())
        .plugin(plugins::database::init(db))
        .plugin(plugins::debug::init())
        .plugin(plugins::default_view::init())
        .plugin(plugins::sleepblocker::init())
        .plugin(plugins::macos::init())
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
            // TODO: Create an alert window in case something goes wrong here

            // We need to inject some stuff in our window, so we are creating it manually
            // Ideally, this would be in the Config plugin, but there seems to be no way
            // to append initialization_scripts to statically created windows.
            let config_manager = app.state::<ConfigManager>();
            let config = config_manager.get().clone();
            let config_json = serde_json::to_string(&config)?;

            let initial_config_script = format!(
                r#"
                    window.__MUSEEKS_INITIAL_CONFIG = {};
                    window.__MUSEEKS_PLATFORM = {:?};
                "#,
                config_json,
                tauri_plugin_os::type_().to_string()
            );

            tauri::WebviewWindowBuilder::new(
                app,
                "main", /* the unique window label */
                tauri::WebviewUrl::App("index.html".into()),
            )
            .title("Museeks")
            .visible(false)
            .hidden_title(true)
            .title_bar_style(tauri::TitleBarStyle::Overlay)
            .inner_size(900.0, 550.0)
            .min_inner_size(900.0, 550.0)
            .fullscreen(false)
            .resizable(true)
            .disable_file_drop_handler()
            .initialization_script(initial_config_script.as_str()) // All of this for that
            .build()?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
