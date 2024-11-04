use ormlite::model::Model;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

/** ----------------------------------------------------------------------------
 * Playlist
 * represent a playlist, that has a name and a list of tracks
 * -------------------------------------------------------------------------- */

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Model, TS)]
#[ormlite(table = "playlists")]
#[ts(export, export_to = "../../src/generated/typings/index.ts")]
pub struct Playlist {
    #[ormlite(primary_key)]
    pub id: String,
    pub name: String,
    #[ormlite(json)]
    pub tracks: Vec<String>, // vector of IDs
    pub import_path: Option<String>, // the path of the file on disk (not set for playlists created in app), ideally, a PathBuf
}
