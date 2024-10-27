use std::path::PathBuf;

use bonsaidb::core::schema::Collection;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

/** ----------------------------------------------------------------------------
 * Playlist
 * represent a playlist, that has a name and a list of tracks
 * -------------------------------------------------------------------------- */

#[derive(Debug, Clone, Serialize, Deserialize, Collection, TS)]
#[collection(name = "playlists", primary_key = String)]
#[ts(export, export_to = "../../src/generated/typings/index.ts")]
pub struct Playlist {
    #[natural_id]
    pub _id: String,
    pub name: String,
    pub tracks: Vec<String>,          // vector of IDs
    pub import_path: Option<PathBuf>, // the path of the file on disk (not set for playlists created in app)
}
