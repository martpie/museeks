use std::{env, fs};

use home_config::HomeConfig;

use crate::plugins::config::Config;
use crate::{
    libs::error::AnyResult,
    plugins::config::{ConfigManager, get_storage_dir},
};

pub fn init() -> AnyResult<ConfigManager> {
    // 1. Ensure Config dir is "museeks" and not Museeks
    let config_dir = dirs::config_dir().expect("Could not find config directory");

    let old_path = config_dir.join("./Museeks");
    let new_path = config_dir.join("./museeks");

    if old_path.exists() && !new_path.exists() {
        fs::rename(&old_path, &new_path)?;
        println!("Renamed config folder from Museeks to museeks");
    }

    // 2. Ensure Config is created and return it
    let conf_path = get_storage_dir();
    let manager = HomeConfig::with_file(conf_path.join("config.toml"));
    let existing_config = manager.toml::<Config>();

    let config = match existing_config {
        Ok(config) => ConfigManager::new(manager, config),
        Err(_) => {
            // The config does not exist, so let's instantiate it with defaults
            // Potential issue: if the config is extended, the defaults will be
            // reloaded
            let default_config = Config::default();
            manager.save_toml(&default_config).unwrap();

            ConfigManager::new(manager, default_config)
        }
    };

    // 3. Ensure Wayland compatibility fixes if the user requests them
    if config.get()?.wayland_compat {
        unsafe {
            env::set_var("GDK_BACKEND", "x11");
            env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
        }
    }

    Ok(config)
}
