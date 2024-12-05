use std::sync::Mutex;

use log::info;
use nosleep::{NoSleep, NoSleepType};
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, Runtime, State};

use crate::libs::error::AnyResult;
use crate::plugins::config::ConfigManager;

pub struct NoSleepInstance(Mutex<NoSleep>);

#[tauri::command]
pub fn enable(
    config_manager: State<ConfigManager>,
    nosleep: State<NoSleepInstance>,
) -> AnyResult<()> {
    config_manager.set_sleepblocker(true)?;

    nosleep
        .0
        .lock()
        .unwrap() // TODO, use ?
        .start(NoSleepType::PreventUserIdleSystemSleep)?;

    info!("Sleepblocker enabled");
    Ok(())
}

#[tauri::command]
pub fn disable(
    config_manager: State<ConfigManager>,
    nosleep: State<NoSleepInstance>,
) -> AnyResult<()> {
    config_manager.set_sleepblocker(false)?;

    nosleep
        .0
        .lock()
        .unwrap() // TODO, use ?
        .stop()?;

    info!("Sleepblocker enabled");
    Ok(())
}

/**
 * Plugin in charge of preventing the app from going to sleep
 */
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("sleepblocker")
        .invoke_handler(tauri::generate_handler![enable, disable])
        .setup(|app_handle, _api| {
            // Add NoSleep to the app state
            app_handle.manage(NoSleepInstance(Mutex::new(NoSleep::new().unwrap())));

            // Enable it right away
            let config_manager = app_handle.state::<ConfigManager>();
            let nosleep = app_handle.state::<NoSleepInstance>();

            if config_manager.get()?.sleepblocker {
                enable(config_manager, nosleep)?;
            }

            Ok(())
        })
        .build()
}
