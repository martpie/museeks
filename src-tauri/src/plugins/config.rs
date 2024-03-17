//! Module in charge of persisting and returning the config to/from the filesystem

use std::{path::PathBuf, sync::RwLock};

use anyhow::{anyhow, Context};
use serde::{Deserialize, Serialize};
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, Runtime, State};
use ts_rs::TS;

use crate::libs::utils::app_config_dir;

const FILE_NAME: &str = "config.toml";

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export, export_to = "../src/generated/typings/Repeat.ts")]
pub enum Repeat {
    All,
    One,
    None,
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export, export_to = "../src/generated/typings/SortBy.ts")]
pub enum SortBy {
    Artist,
    Album,
    Title,
    Duration,
    Genre,
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export, export_to = "../src/generated/typings/SortOrder.ts")]
pub enum SortOrder {
    Asc,
    Dsc,
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export, export_to = "../src/generated/typings/DefaultView.ts")]
pub enum DefaultView {
    Library,
    Playlists,
}

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export, export_to = "../src/generated/typings/Config.ts")]
pub struct Config {
    pub theme: String,
    pub audio_volume: f32,
    pub audio_playback_rate: f32,
    pub audio_output_device: String,
    pub audio_muted: bool,
    pub audio_shuffle: bool,
    pub audio_repeat: Repeat,
    pub default_view: DefaultView,
    pub library_sort_by: SortBy,
    pub library_sort_order: SortOrder,
    pub library_folders: Vec<PathBuf>, // Not used yet
    pub sleepblocker: bool,
    pub auto_update_checker: bool,
    pub minimize_to_tray: bool,
    pub notifications: bool,
    pub track_view_density: String,
}

impl Config {
    pub fn default() -> Self {
        Config {
            theme: "__system".to_owned(),
            audio_volume: 1.0,
            audio_playback_rate: 1.0,
            audio_output_device: "default".to_owned(),
            audio_muted: false,
            audio_shuffle: false,
            audio_repeat: Repeat::None,
            default_view: DefaultView::Library,
            library_sort_by: SortBy::Artist,
            library_sort_order: SortOrder::Asc,
            library_folders: vec![],
            sleepblocker: false,
            auto_update_checker: true,
            minimize_to_tray: false,
            notifications: false,
            track_view_density: "normal".to_owned(),
        }
    }
}

#[derive(Debug)]
pub struct ConfigManager {
    pub config: RwLock<Config>,
}

impl ConfigManager {
    pub fn read(&self) -> Config {
        self.config.read().unwrap().clone()
    }

    pub fn update(&self, config: Config) {
        // Prevent concurrent changes while writing to the file.
        let mut writer = self.config.write().unwrap();
        if let Err(err) = save_config_to_file(&config) {
            log::error!("Failed to save config: {err}");
            return;
        }
        // Only update the config after successfully writing to the file.
        *writer = config;
    }

    pub fn set_sleepblocker(&self, sleepblocker: bool) {
        // TODO: Avoid race conditions and cloning? Probably not necessary.
        let config = Config {
            sleepblocker,
            ..self.config.read().unwrap().clone()
        };
        self.update(config);
    }

    pub fn set_default_view(&self, default_view: DefaultView) {
        // TODO: Avoid race conditions and cloning? Probably not necessary.
        let config = Config {
            default_view,
            ..self.config.read().unwrap().clone()
        };
        self.update(config);
    }
}

fn config_file_path() -> anyhow::Result<PathBuf> {
    app_config_dir()
        .map(|dir| dir.join(FILE_NAME))
        .ok_or_else(|| anyhow!("no app config directory"))
}

fn load_config_from_file() -> anyhow::Result<Config> {
    let file_path = config_file_path()?;
    let contents =
        std::fs::read_to_string(&file_path).with_context(|| file_path.display().to_string())?;
    toml::from_str::<Config>(&contents).map_err(Into::into)
}

fn save_config_to_file(config: &Config) -> anyhow::Result<()> {
    let file_path = config_file_path()?;
    let contents = toml::to_string_pretty(config)?;
    std::fs::write(&file_path, contents).with_context(|| file_path.display().to_string())?;
    log::info!(
        "Config saved to file: {file_path}",
        file_path = file_path.display()
    );
    Ok(())
}

#[tauri::command]
pub fn get_config(config_manager: State<ConfigManager>) -> Config {
    config_manager.read()
}

#[tauri::command]
pub fn set_config(config_manager: State<ConfigManager>, config: Config) {
    config_manager.update(config);
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    let existing_config = load_config_from_file();

    let config = match existing_config {
        Ok(config) => ConfigManager {
            config: RwLock::new(config),
        },
        Err(_) => {
            // The config does not exist, so let's instantiate it with defaults
            // Potential issue: if the config is extended, the defaults will be
            // reloaded
            let default_config = Config::default();
            if let Err(err) = save_config_to_file(&default_config) {
                log::warn!("Failed to save default config: {err}");
            }

            ConfigManager {
                config: RwLock::new(default_config),
            }
        }
    };

    // We need to inject the initial state of the config to the window object of
    // our webview, because some of our front-end modules are instantiated at
    // parsing time and require data that would otherwise only load-able asynchronously
    let initial_config_script = format!(
        r#"
            window.__MUSEEKS_INITIAL_CONFIG = {};
            window.__MUSEEKS_PLATFORM = {:?};
        "#,
        serde_json::to_string(&config.read()).unwrap(),
        tauri_plugin_os::type_().to_string()
    );

    Builder::<R>::new("config")
        .invoke_handler(tauri::generate_handler![get_config, set_config,])
        .js_init_script(initial_config_script)
        .setup(|app_handle, _api| {
            app_handle.manage(config);
            Ok(())
        })
        .build()
}
