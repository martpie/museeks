/**
 * Small utility to display time metrics with a log message
 */
use log::info;
use std::{ffi::OsStr, path::PathBuf, time::Instant};
use tauri::{Runtime, Theme, WebviewWindow};
use walkdir::WalkDir;

use crate::plugins::config::SYSTEM_THEME;

/**
 * Small helper to compute the execution time of some code
 */
pub struct TimeLogger {
    start_time: Instant,
    message: String,
}

impl TimeLogger {
    pub fn new(message: String) -> Self {
        TimeLogger {
            start_time: Instant::now(),
            message,
        }
    }

    pub fn complete(&self) {
        let duration = self.start_time.elapsed();
        info!("{} in {:.2?}", self.message, duration);
    }
}

/**
 * Check if a directory or a file is visible or not, by checking if it start
 * with a dot
 */
fn is_dir_visible(entry: &walkdir::DirEntry) -> bool {
    entry
        .file_name()
        .to_str()
        .map(|s| !s.starts_with("."))
        .unwrap_or(false)
}

/**
 * Take an entry and filter out non-allowed extensions
 */
pub fn is_file_valid(path: &PathBuf, allowed_extensions: &[&str]) -> bool {
    let extension = path.extension().and_then(OsStr::to_str).unwrap_or("");
    allowed_extensions.contains(&extension)
}

/**
 * Scan multiple directories and filter files by extension
 */
pub fn scan_dirs(paths: &Vec<PathBuf>, allowed_extensions: &[&str]) -> Vec<PathBuf> {
    paths
        .iter()
        .map(|path| scan_dir(path, allowed_extensions))
        .flatten()
        .collect()
}

/**
 * Scan directory and filter files by extension
 */
pub fn scan_dir(path: &PathBuf, allowed_extensions: &[&str]) -> Vec<PathBuf> {
    WalkDir::new(path)
        .follow_links(true)
        .into_iter()
        .filter_entry(|entry| is_dir_visible(entry) && entry.file_type().is_file())
        .filter_map(Result::ok)
        .map(|entry| entry.into_path())
        .filter(|path| is_file_valid(path, allowed_extensions))
        .collect()
}

/**
 * Ensure a window is shown and visible
 */
pub fn show_window<R: Runtime>(window: &WebviewWindow<R>) {
    window.maximize().unwrap();
    window.show().unwrap();
    window.set_focus().unwrap();
}

/**
 * Give an arbitrary string (usually the theme value from the config), returns
 * a Tauri theme
 */
pub fn get_theme_from_name(theme_name: &str) -> Option<Theme> {
    match theme_name {
        "light" => Some(Theme::Light),
        "dark" => Some(Theme::Dark),
        SYSTEM_THEME => None,
        _ => None, // ? :]
    }
}
