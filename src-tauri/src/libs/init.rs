use std::fs;

use crate::libs::error::AnyResult;

pub fn init() -> AnyResult<()> {
    let config_dir_check = ensure_new_config_dir()?;

    match config_dir_check {
        Some(message) => println!("[init] {}", message),
        None => println!("[init] No actions needed"),
    }

    Ok(())
}

fn ensure_new_config_dir() -> AnyResult<Option<String>> {
    let config_dir = dirs::config_dir().expect("Could not find config directory");

    let old_path = config_dir.join("./Museeks");
    let new_path = config_dir.join("./museeks");

    if old_path.exists() && !new_path.exists() {
        fs::rename(&old_path, &new_path)?;
        return Ok(Some("Renamed config folder from Museeks to museeks".into()));
    }

    Ok(None)
}
