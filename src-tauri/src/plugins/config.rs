/**
 * Module in charge of persisting and returning the config to/from the filesystem
 */
use home_config::HomeConfig;
use log::info;
use serde::{Deserialize, Serialize};
use std::{path::PathBuf, sync::RwLock};
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, Runtime, State};
use ts_rs::TS;

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
    manager: HomeConfig,
    pub data: RwLock<Config>,
}

impl ConfigManager {
    pub fn get(&self) -> Config {
        self.data.read().unwrap().clone()
    }

    pub fn update(&self, config: Config) {
        let mut writer = self.data.write().unwrap();
        *writer = config;
        std::mem::drop(writer);
        self.save();
    }

    pub fn set_sleepblocker(&self, sleepblocker: bool) {
        let mut writer = self.data.write().unwrap();
        writer.sleepblocker = sleepblocker;
        std::mem::drop(writer);
        self.save();
    }

    pub fn set_default_view(&self, default_view: DefaultView) {
        let mut writer = self.data.write().unwrap();
        writer.default_view = default_view;
        std::mem::drop(writer);
        self.save();
    }

    fn save(&self) {
        let config = self.data.read().unwrap();
        self.manager.save_toml(config.clone()).unwrap();
        info!("Config updated");
    }
}

/**
 * Get the app configuration/storage directory
 */
#[tauri::command]
pub fn get_storage_dir() -> PathBuf {
    // TODO: Replace with PathResolver::app_config_dir() + app identifier, somehow
    let path = dirs::config_dir().expect("Get config dir");
    path.join("Museeks")
}

#[tauri::command]
pub fn get_config(config_manager: State<ConfigManager>) -> Config {
    config_manager.get()
}

#[tauri::command]
pub fn set_config(config_manager: State<ConfigManager>, config: Config) {
    config_manager.update(config);
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    let conf_path = get_storage_dir();
    let manager = HomeConfig::with_file(conf_path.join("config.toml"));
    let existing_config = manager.toml::<Config>();

    let config = match existing_config {
        Ok(config) => ConfigManager {
            manager,
            data: RwLock::new(config),
        },
        Err(_) => {
            // The config does not exist, so let's instantiate it with defaults
            // Potential issue: if the config is extended, the defaults will be
            // reloaded
            let default_config = Config::default();
            manager.save_toml(&default_config).unwrap();

            ConfigManager {
                manager,
                data: RwLock::new(default_config),
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
        serde_json::to_string(&config.get()).unwrap(),
        tauri_plugin_os::type_().to_string()
    );

    Builder::<R>::new("config")
        .invoke_handler(tauri::generate_handler![
            get_storage_dir,
            get_config,
            set_config,
        ])
        .js_init_script(initial_config_script)
        .setup(|app_handle, _api| {
            app_handle.manage(config);
            Ok(())
        })
        .build()
}
