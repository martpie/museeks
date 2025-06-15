use std::fs;

use crate::libs::error::AnyResult;

pub fn init() -> AnyResult<()> {
    ensure_new_config_dir()?;

    Ok(())
}

fn ensure_new_config_dir() -> AnyResult<()> {
    let config_dir = dirs::config_dir().expect("Could not find config directory");

    let old_path = config_dir.join("./Museeks");
    let new_path = config_dir.join("./museeks");

    println!("{:?}", &old_path.exists());
    println!("{:?}", &new_path.exists());

    if old_path.exists() && !new_path.exists() {
        fs::rename(&old_path, &new_path)?;
        println!("Renamed config folder from Museeks to museeks");
    } else {
        println!("No special initialization needed");
    }

    Ok(())
}
