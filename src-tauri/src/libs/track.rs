use std::path::PathBuf;

use lofty::file::{AudioFile, TaggedFileExt};
use lofty::tag::{Accessor, ItemKey};
use log::warn;
use ormlite::model::Model;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

/**
 * Track
 * represent a single track, id and path should be unique
 */
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Model, TS)]
#[ormlite(table = "tracks")]
#[ts(export, export_to = "../../src/generated/typings/index.ts")]
pub struct Track {
    #[ormlite(primary_key)]
    pub id: String,
    pub path: String, // must be unique, ideally, a PathBuf
    pub title: String,
    pub album: String,
    #[ormlite(json)]
    pub artists: Vec<String>,
    #[ormlite(json)]
    pub genres: Vec<String>,
    pub year: Option<u32>,
    pub duration: u32,
    pub track_no: Option<u32>,
    pub track_of: Option<u32>,
    pub disk_no: Option<u32>,
    pub disk_of: Option<u32>,
}

/**
 * Generate a Track struct from a Path, or nothing if it is not a valid audio
 * file
 */
pub fn get_track_from_file(path: &PathBuf) -> Option<Track> {
    match lofty::read_from_path(path) {
        Ok(tagged_file) => {
            let tag = tagged_file.primary_tag()?;

            // IMPROVE ME: Is there a more idiomatic way of doing the following?
            let mut artists: Vec<String> = tag
                .get_strings(&ItemKey::TrackArtist)
                .map(ToString::to_string)
                .collect();

            if artists.is_empty() {
                artists = tag
                    .get_strings(&ItemKey::AlbumArtist)
                    .map(ToString::to_string)
                    .collect();
            }

            if artists.is_empty() {
                artists = vec!["Unknown Artist".into()];
            }

            let id = get_track_id_for_path(path)?;

            Some(Track {
                id,
                path: path.to_string_lossy().into_owned(),
                title: tag
                    .get_string(&ItemKey::TrackTitle)
                    .unwrap_or("Unknown")
                    .to_string(),
                album: tag
                    .get_string(&ItemKey::AlbumTitle)
                    .unwrap_or("Unknown")
                    .to_string(),
                artists,
                genres: tag
                    .get_strings(&ItemKey::Genre)
                    .map(ToString::to_string)
                    .collect(),
                year: tag.year(),
                duration: u32::try_from(tagged_file.properties().duration().as_secs()).unwrap_or(0),
                track_no: tag.track(),
                track_of: tag.track_total(),
                disk_no: tag.disk(),
                disk_of: tag.disk_total(),
            })
        }
        Err(err) => {
            warn!("Failed to get ID3 tags: \"{}\". File {:?}", err, path);
            None
        }
    }
}

/**
 * Generate an ID for a track based on its location.
 *
 * We leverage UUID v3 on tracks paths to easily retrieve tracks by path.
 * This is not great and ideally we should use a DB view instead. One day.
 */
pub fn get_track_id_for_path(path: &PathBuf) -> Option<String> {
    match std::fs::canonicalize(path) {
        Ok(canonicalized_path) => Some(
            Uuid::new_v3(
                &Uuid::NAMESPACE_OID,
                canonicalized_path.to_string_lossy().as_bytes(),
            )
            .to_string(),
        ),
        Err(err) => {
            warn!(r#"ID could not be generated for path {:?}: {}"#, path, err);
            None
        }
    }
}
