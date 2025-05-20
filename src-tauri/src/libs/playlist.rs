use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use ts_rs::TS;

/** ----------------------------------------------------------------------------
 * Playlist
 * represent a playlist, that has a name and a list of tracks
 * -------------------------------------------------------------------------- */

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, FromRow, TS)]
#[ts(export, export_to = "../../src/generated/typings.ts")]
pub struct Playlist {
    pub id: String,
    pub name: String,
    #[sqlx(json)]
    pub tracks: Vec<String>, // vector of IDs
    pub import_path: Option<String>, // the path of the file on disk (not set for playlists created in app), ideally, a PathBuf
}
