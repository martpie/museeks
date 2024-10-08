use std::path::PathBuf;

use bonsaidb::core::schema::Collection;
use lofty::file::{AudioFile, TaggedFileExt};
use lofty::tag::{Accessor, ItemKey};
use log::{error, warn};
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

/**
 * Track
 * represent a single track, id and path should be unique
 */
#[derive(Debug, Clone, Serialize, Deserialize, Collection, TS)]
#[collection(name="tracks", primary_key = String)]
#[ts(export, export_to = "../../src/generated/typings/index.ts")]
pub struct Track {
    #[natural_id]
    pub _id: String,
    pub title: String,
    pub album: String,
    pub artists: Vec<String>,
    pub genres: Vec<String>,
    pub year: Option<u32>,
    pub duration: u32,
    pub track: NumberOf,
    pub disk: NumberOf,
    pub path: PathBuf,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/generated/typings/index.ts")]
pub struct NumberOf {
    pub no: Option<u32>,
    pub of: Option<u32>,
}

/**
 * Generate a Track struct from a Path, or nothing if it is not a valid audio
 * file
 */
pub fn get_track_from_file(path: &PathBuf) -> Option<Track> {
    match lofty::read_from_path(&path) {
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

            let Some(id) = get_track_id_for_path(path) else {
                return None;
            };

            Some(Track {
                _id: id,
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
                track: NumberOf {
                    no: tag.track(),
                    of: tag.track_total(),
                },
                disk: NumberOf {
                    no: tag.disk(),
                    of: tag.disk_total(),
                },
                path: path.to_owned(),
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
        Ok(canonicalized_path) => {
            return Some(
                Uuid::new_v3(
                    &Uuid::NAMESPACE_OID,
                    canonicalized_path.to_string_lossy().as_bytes(),
                )
                .to_string(),
            );
        }
        Err(err) => {
            error!(r#"ID could not be generated for path {:?}: {}"#, path, err);
            return None;
        }
    };
}
