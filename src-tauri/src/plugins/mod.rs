/**
 * Those are a bunch of Tauri plugins used to interact with the Operating Systems
 * features, like global menu, sleep-blocker, dock, thumbar, etc.
 *
 * It also holds the different DB creations and various helpers.
 */
pub mod debug;

/**
 * Stores
 */
pub mod config;
pub mod database;

/**
 * Settings-related plugins
 */
pub mod app_menu;
pub mod default_view;
pub mod sleepblocker;
