// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod libs;
mod plugins;

use libs::utils::{get_theme_from_name, show_window};
use log::LevelFilter;
use plugins::config::ConfigManager;
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_log::fern::colors::ColoredLevelConfig;
use tauri_plugin_log::{Target, TargetKind};
use tauri_plugin_window_state::StateFlags;

/**
 * The beast
 */
#[tokio::main]
async fn main() {
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
        .plugin(plugins::app_close::init())
        .plugin(plugins::app_menu::init())
        .plugin(plugins::config::init())
        .plugin(plugins::cover::init())
        .plugin(plugins::database::init())
        .plugin(plugins::debug::init())
        .plugin(plugins::default_view::init())
        .plugin(plugins::shell_extension::init())
        .plugin(plugins::sleepblocker::init())
        // Tauri integrations with the Operating System
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_single_instance::init(|app_handle, _, _| {
            let window = app_handle.get_webview_window("main").unwrap();
            show_window(&window);
        }))
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_state_flags(
                    StateFlags::all() & !StateFlags::VISIBLE, // Museeks manages its visible state by itself
                )
                .build(),
        )
        // TODO: tauri-plugin-theme to update the native theme at runtime
        .setup(|app| {
            let config_manager = app.state::<ConfigManager>();
            let conf = config_manager.get()?;

            // We intentionally create the window ourselves to set the window theme to the right value
            let window_builder =
                WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                    .title("Museeks")
                    .visible(false)
                    .theme(get_theme_from_name(&conf.theme))
                    .inner_size(900.0, 550.0)
                    .min_inner_size(900.0, 550.0)
                    .fullscreen(false)
                    .resizable(true)
                    .disable_drag_drop_handler() // TODO: Windows drag-n-drop on windows does not work :| https://github.com/tauri-apps/wry/issues/904
                    .zoom_hotkeys_enabled(true);

            #[cfg(target_os = "macos")]
            window_builder
                .hidden_title(true)
                .title_bar_style(tauri::TitleBarStyle::Overlay)
                .build()?;

            #[cfg(not(target_os = "macos"))]
            window_builder.build()?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
