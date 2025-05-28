use anyhow::Result;
use lofty::error::LoftyError;
use log::error;
use serde::{Serialize, ser::Serializer};
use tauri::Runtime;
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};
use thiserror::Error;

/**
 * Create the error type that represents all errors possible in our program
 * Stolen from https://github.com/tauri-apps/tauri/discussions/3913
 */
#[derive(Debug, Error)]
pub enum MuseeksError {
    #[error(transparent)]
    IO(#[from] std::io::Error),

    #[error(transparent)]
    Tauri(#[from] tauri::Error),

    #[error(transparent)]
    Lofty(#[from] LoftyError),

    #[error(transparent)]
    Sqlx(#[from] sqlx::Error),

    #[error(transparent)]
    SqlxMigrate(#[from] sqlx::migrate::MigrateError),

    #[error(transparent)]
    NoSleep(#[from] nosleep::Error),

    #[error("An error occurred while manipulating the config: {0}")]
    Config(String),

    #[error(transparent)]
    Unknown(#[from] anyhow::Error),

    /**
     * Custom errors
     */
    #[error("Playlist not found")]
    PlaylistNotFound,
}

/**
 * Let's make anyhow's errors Tauri friendly, so they can be used for commands
 */
impl Serialize for MuseeksError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

pub type AnyResult<T, E = MuseeksError> = Result<T, E>;

/**
 * Log an error, show blocking dialog with the error message, then exit the app
 */
pub fn handle_fatal_error<R: Runtime>(app_handle: &tauri::AppHandle<R>, err: MuseeksError) {
    error!("Something went wrong: {:?}", err);
    app_handle
        .dialog()
        .message(format!("Something went wrong: {}", err))
        .kind(MessageDialogKind::Error)
        .blocking_show();
    app_handle.exit(1);
}
