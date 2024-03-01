use anyhow::Result;
use serde::{ser::Serializer, Serialize};
use thiserror::Error;

/**
 * Create the error type that represents all errors possible in our program
 * Stolen from https://github.com/tauri-apps/tauri/discussions/3913
 */
#[derive(Debug, Error)]
pub enum MuseeksError {
    #[error(transparent)]
    Lofty(#[from] lofty::LoftyError),

    #[error(transparent)]
    Database(#[from] bonsaidb::core::Error),

    #[error(transparent)]
    LocalDatabase(#[from] bonsaidb::local::Error),

    #[error(transparent)]
    NoSleep(#[from] nosleep::Error),

    #[error("{message}")]
    Command { message: String },

    #[error(transparent)]
    Unknown(#[from] anyhow::Error),
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
