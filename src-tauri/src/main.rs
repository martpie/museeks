// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod libs;
mod plugins;

use libs::file_associations::setup_file_associations;
use libs::utils::get_theme_from_name;
use log::{info, LevelFilter};
use plugins::config::{get_storage_dir, ConfigManager};
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_log::fern::colors::ColoredLevelConfig;
use tauri_plugin_log::{Target, TargetKind};
use tauri_plugin_window_state::StateFlags;

/**
 * The beast
 */
fn main() {
    tauri::Builder::default()
        // Logging must be setup first, otherwise the logs won't be captured
        // while setting up the other plugins.
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::Webview),
                    Target::new(TargetKind::Folder {
                        path: get_storage_dir(),
                        file_name: Some("syncudio".into()),
                    }),
                ])
                .level(LevelFilter::Info)
                // Prevent noisy logs from logging
                .level_for("lofty", LevelFilter::Error)
                .with_colors(ColoredLevelConfig::default())
                .build(),
        )
        // Custom integrations
        .plugin(plugins::app_close::init())
        .plugin(plugins::app_menu::init())
        .plugin(plugins::config::init())
        .plugin(plugins::cover::init())
        .plugin(plugins::db::init())
        .plugin(plugins::debug::init())
        .plugin(plugins::default_view::init())
        .plugin(plugins::sleepblocker::init())
        // Tauri integrations with the Operating System
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_single_instance::init(|app_handle, _, _| {
            // Focus on the already running app in case the app is opened again
            let window = app_handle.get_webview_window("main").unwrap();
            window.set_focus().unwrap();
        }))
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_state_flags(
                    StateFlags::all() & !StateFlags::VISIBLE, // Syncudio manages its visible state by itself
                )
                .build(),
        )
        .setup(|app| {
            let config_manager = app.state::<ConfigManager>();
            let conf = config_manager.get()?;

            // We intentionally create the window ourselves to set the window theme to the right value
            let window_builder =
                WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                    .title("Syncudio")
                    .visible(false)
                    .theme(get_theme_from_name(&conf.theme))
                    .inner_size(900.0, 550.0)
                    .min_inner_size(900.0, 550.0)
                    .fullscreen(false)
                    .resizable(true)
                    .zoom_hotkeys_enabled(true);

            // TODO: Windows drag-n-drop on windows does not work :|
            // https://github.com/tauri-apps/wry/issues/904
            #[cfg(target_os = "windows")]
            window_builder.disable_drag_drop_handler().build()?;

            // On macOS, we hide the native frame and use overlay controls as they're nicer
            #[cfg(target_os = "macos")]
            window_builder
                .hidden_title(true)
                .title_bar_style(tauri::TitleBarStyle::Overlay)
                .build()?;

            #[cfg(target_os = "linux")]
            window_builder.build()?;

            info!("Main window built");

            // FIXME: File association for non-macOS is not working well:
            // - Does not work with single instance when the app is already open
            // - Issues with C:\... URLs parsing with rust-url
            // - The main window is created, but the UI may not be ready yet to receive the event requesting a playback
            #[cfg(not(target_os = "macos"))]
            setup_file_associations(app);

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(
            #[allow(unused_variables)]
            |app_handle, event| {
                #[cfg(target_os = "macos")]
                setup_file_associations(app_handle, event);
            },
        );
}
