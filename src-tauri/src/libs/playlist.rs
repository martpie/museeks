use geekorm::prelude::TablePrimaryKey;
use geekorm::{GeekConnector, QueryBuilderTrait, Table, TableBuilder};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

/** ----------------------------------------------------------------------------
 * Playlist
 * represent a playlist, that has a name and a list of tracks
 * -------------------------------------------------------------------------- */

#[derive(Debug, Clone, Serialize, Deserialize, Table, TS)]
#[ts(export, export_to = "../../src/generated/typings/index.ts")]
pub struct Playlist {
    #[geekorm(primary_key)]
    pub id: String,
    pub name: String,
    pub tracks: Vec<String>, // vector of IDs
    #[geekorm(unique)]
    pub import_path: Option<String>, // the path of the file on disk (not set for playlists created in app), ideally, a PathBuf
}
