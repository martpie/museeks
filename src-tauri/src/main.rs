// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod libs;
mod plugins;

use libs::init::init;
use libs::utils::get_theme_from_name;
use log::{LevelFilter, info};
use plugins::config::{ConfigManager, get_storage_dir};
use std::env;
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_log::fern::colors::ColoredLevelConfig;
use tauri_plugin_log::{Target, TargetKind};
use tauri_plugin_window_state::StateFlags;

/**
 * The beast
 */
fn main() {
    let config = match init() {
        Ok(config) => {
            println!("[init] Initialization successful");
            config
        }
        Err(e) => {
            println!("[init] Error during initialization: {}", e);
            std::process::exit(1);
        }
    };

    // On Linux, start a local HTTP server for audio streaming.
    // WebKitGTK's asset protocol doesn't support media streaming properly.
    #[cfg(target_os = "linux")]
    let stream_server_port = plugins::stream_server::start();

    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        // Logging must be setup first, otherwise the logs won't be captured
        // while setting up the other plugins.
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::Webview),
                    Target::new(TargetKind::Folder {
                        path: get_storage_dir(),
                        file_name: Some("museeks".into()),
                    }),
                ])
                .level(LevelFilter::Info)
                // Prevent noisy logs from logging
                .level_for("lofty", LevelFilter::Error)
                .with_colors(ColoredLevelConfig::default())
                .max_file_size(50_000)
                .build(),
        )
        // Ensure a single instance of the app is running, if needed, play opened files
        .plugin(tauri_plugin_single_instance::init(|app_handle, args, _| {
            // Focus on the already running app in case the app is opened again
            let window = app_handle.get_webview_window("main").unwrap();
            window.set_focus().unwrap();

            plugins::file_associations::handle_opened_files(app_handle, args);
        }))
        // Custom integrations
        .plugin(plugins::app_close::init())
        .plugin(plugins::app_menu::init())
        .plugin(plugins::config::init(config))
        .plugin(plugins::cover::init())
        .plugin(plugins::db::init())
        .plugin(plugins::debug::init())
        .plugin(plugins::default_view::init())
        .plugin(plugins::file_associations::init())
        .plugin(plugins::sleepblocker::init())
        // Tauri integrations with the Operating System
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_prevent_default::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_state_flags(
                    StateFlags::all() & !StateFlags::VISIBLE, // Museeks manages its visible state by itself
                )
                .build(),
        );

    // Linux-only: local HTTP server for audio streaming
    // (WebKitGTK's asset protocol doesn't support media streaming)
    #[cfg(target_os = "linux")]
    let builder = builder.plugin(plugins::stream_server::init(stream_server_port));

    builder
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
                .traffic_light_position(tauri::Position::Logical(tauri::LogicalPosition {
                    x: 10.0,
                    y: 23.0,
                }))
                .build()?;

            #[cfg(target_os = "linux")]
            window_builder.build()?;

            info!("Main window built");

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        // Handle file associations on macOS, this will get triggered when the
        // app starts, AND when the app is already running and a file is opened.
        .run(
            #[allow(unused_variables)]
            |app_handle, event| {
                #[cfg(target_os = "macos")]
                plugins::file_associations::handle_run_event(app_handle, event);
            },
        );
}
