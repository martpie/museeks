/**
 * Small utility to display time metrics with a log message
 */
use log::info;
use std::{ffi::OsStr, path::PathBuf, time::Instant};
use walkdir::WalkDir;

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
 * Get the app configuration/storage directory
 */
pub fn get_app_storage_dir() -> PathBuf {
    let path = dirs::home_dir().expect("Get home dir");
    path.join(".museeks")
}

/**
 * Check if a directory or a file is visible or not
 */
fn is_dir_visible(entry: &walkdir::DirEntry) -> bool {
    entry
        .file_name()
        .to_str()
        .map(|s| !s.starts_with("."))
        .unwrap_or(false)
}

/**
 * Take an entry and filter out:
 *   - directories
 *   - non-allowed extensions
 */
fn is_entry_valid(
    result: std::result::Result<walkdir::DirEntry, walkdir::Error>,
    allowed_extensions: &[&str],
) -> Option<String> {
    // If the user does not have access to the file
    if result.is_err() {
        return None;
    }

    let entry = result.unwrap();
    let file_type = entry.file_type();

    let extension = entry
        .path()
        .extension()
        .and_then(OsStr::to_str)
        .unwrap_or("");

    let is_file = file_type.is_file();
    let has_valid_extension = allowed_extensions.contains(&extension);

    if is_file && has_valid_extension {
        // Only return the file path, that's what we're interested in
        return entry.path().to_str().map(str::to_string);
    }

    return None;
}

/**
 * Scan multiple directories and filter files by extension
 */
pub fn scan_dirs(paths: &Vec<String>, allowed_extensions: &[&str]) -> Vec<String> {
    paths
        .iter()
        .map(|path| scan_dir(path, allowed_extensions))
        .flatten()
        .collect()
}

/**
 * Scan directory and filter files by extension
 */
pub fn scan_dir(path: &String, allowed_extensions: &[&str]) -> Vec<String> {
    WalkDir::new(path)
        .follow_links(true)
        .into_iter()
        .filter_entry(|entry| is_dir_visible(entry))
        .filter_map(|entry| is_entry_valid(entry, allowed_extensions))
        .collect()
}
