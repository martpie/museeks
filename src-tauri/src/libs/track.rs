use lofty::file::{AudioFile, TaggedFileExt};
use lofty::tag::{Accessor, ItemKey};
use log::warn;
use rayon::iter::IntoParallelRefIterator;
use rayon::iter::ParallelIterator;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use std::path::PathBuf;
use ts_rs::TS;
use uuid::Uuid;

use crate::libs::database::SUPPORTED_TRACKS_EXTENSIONS;
use crate::libs::error::{AnyResult, MuseeksError};
use crate::libs::utils::is_file_valid;

/**
 * Track
 * represent a single track, id and path should be unique
 */
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, FromRow, TS)]
#[ts(export, export_to = "../../src/generated/typings.ts")]
pub struct Track {
    pub id: String,
    pub path: String, // must be unique, ideally, a PathBuf
    // Fields used for display
    pub title: String,
    pub title_sort: Option<String>,
    pub album: String,
    pub album_sort: Option<String>,
    pub album_artist: String,
    pub album_artist_sort: Option<String>,
    #[sqlx(json)]
    pub artists: Vec<String>, // JSON
    // Other Metadata
    #[sqlx(json)]
    pub genres: Vec<String>, // JSON
    pub year: Option<u16>,
    pub duration: u32,
    pub track_no: Option<u32>,
    pub track_of: Option<u32>,
    pub disk_no: Option<u32>,
    pub disk_of: Option<u32>,
    pub is_compilation: bool,
}

/**
 * Represents a group of tracks, grouped by "something", lib artist name, or
 * album name
 */
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/generated/typings.ts")]
pub struct TrackGroup {
    pub label: String,
    pub genres: Vec<String>,
    pub duration: u32,
    pub year: Option<u16>,
    pub tracks: Vec<Track>,
}

/**
 * Generate a Track struct from a Path, or nothing if it is not a valid audio
 * file
 */
pub fn get_track_from_file(path: &PathBuf) -> AnyResult<Track> {
    match lofty::read_from_path(path) {
        Ok(tagged_file) => {
            let tag = tagged_file.primary_tag().ok_or_else(|| {
                warn!("No tags found for file {:?}", path);
                MuseeksError::ID3NoTags(path.clone())
            })?;

            // Lots of tags are missing eaither TrackArtist or AlbumArtist, so instead
            // of being correct, we'll swap them if needed.
            // IMPROVE ME: Is there a more idiomatic way of doing the following?
            let mut artists: Vec<String> = tag
                .get_strings(ItemKey::TrackArtist)
                .map(ToString::to_string)
                .filter(|s| !s.is_empty())
                .collect();

            if artists.is_empty() {
                artists = tag
                    .get_strings(ItemKey::AlbumArtist)
                    .map(ToString::to_string)
                    .filter(|s| !s.is_empty())
                    .collect();
            }

            if artists.is_empty() {
                artists = vec!["Unknown Artist".into()];
            }

            // Try AlbumArtist, fallback to first artist, then to "Unknown Artist"
            let album_artist = tag
                .get_string(ItemKey::AlbumArtist)
                .map(ToString::to_string)
                .or_else(|| artists.first().cloned())
                .filter(|s| !s.is_empty())
                .unwrap_or_else(|| "Unknown Artist".to_string());

            let id = get_track_id_for_path(path)?;

            let is_compilation = tag
                .get_string(ItemKey::FlagCompilation)
                .map_or(false, |v| v == "1" || v.eq_ignore_ascii_case("true"));

            let title = tag
                .get_string(ItemKey::TrackTitle)
                .filter(|s| !s.trim().is_empty())
                .map(ToString::to_string)
                .unwrap_or_else(|| {
                    path.file_name()
                        .and_then(|f| f.to_str())
                        .unwrap_or("Unknown")
                        .to_string()
                });

            let album = tag
                .get_string(ItemKey::AlbumTitle)
                .filter(|s| !s.trim().is_empty())
                .map(ToString::to_string)
                .unwrap_or_else(|| "Unknown".to_string());

            let title_sort = tag
                .get_string(ItemKey::TrackTitleSortOrder)
                .filter(|s| !s.trim().is_empty())
                .map(ToString::to_string);

            let album_sort = tag
                .get_string(ItemKey::AlbumTitleSortOrder)
                .filter(|s| !s.trim().is_empty())
                .map(ToString::to_string);

            let album_artist_sort = tag
                .get_string(ItemKey::AlbumArtistSortOrder)
                .filter(|s| !s.trim().is_empty())
                .map(ToString::to_string);

            Ok(Track {
                id,
                path: path.to_string_lossy().into_owned(),
                title,
                title_sort,
                album,
                album_sort,
                album_artist,
                album_artist_sort,
                artists,
                genres: tag
                    .get_strings(ItemKey::Genre)
                    .map(ToString::to_string)
                    .filter(|s| !s.is_empty())
                    .collect(),
                year: tag.date().map(|d| d.year),
                duration: u32::try_from(tagged_file.properties().duration().as_secs()).unwrap_or(0),
                track_no: tag.track(),
                track_of: tag.track_total(),
                disk_no: tag.disk(),
                disk_of: tag.disk_total(),
                is_compilation,
            })
        }
        Err(err) => {
            warn!("Failed to get ID3 tags: \"{}\". File {:?}", err, path);
            Err(MuseeksError::Lofty(err))
        }
    }
}

/**
 * Generate an ID for a track based on its location.
 *
 * We leverage UUID v3 on tracks paths to easily retrieve tracks by path.
 * This is not great and ideally we should use a DB view instead. One day.
 */
pub fn get_track_id_for_path(path: &PathBuf) -> AnyResult<String> {
    match std::fs::canonicalize(path) {
        Ok(canonicalized_path) => Ok(Uuid::new_v3(
            &Uuid::NAMESPACE_OID,
            canonicalized_path.to_string_lossy().as_bytes(),
        )
        .to_string()),
        Err(err) => {
            warn!(r#"ID could not be generated for path {:?}: {}"#, path, err);
            Err(MuseeksError::IDGeneration(path.clone()))
        }
    }
}

/**
 * Given a list of files, return a potential list of tracks
 */
pub fn get_tracks_from_paths(mut files: Vec<PathBuf>) -> Vec<AnyResult<Track>> {
    files.retain(|path| is_file_valid(path, &SUPPORTED_TRACKS_EXTENSIONS));

    // Build a list of tracks, without importing them to the library
    files
        .par_iter()
        .map(get_track_from_file)
        .collect::<Vec<_>>()
}
