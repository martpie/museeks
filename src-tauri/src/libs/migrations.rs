use std::path::PathBuf;

use lofty::file::TaggedFileExt;
use lofty::tag::ItemKey;

use super::database::DB;
use super::error::AnyResult;

pub struct Migration {
    id: &'static str,
    sql: &'static str,
    backfill_fn: Option<fn() -> AnyResult<()>>,
}

pub static MIGRATIONS: &[Migration] = &[Migration {
    id: "v1_add_album_artist_column",
    sql: r#"
          -- Add the new column, ensure it's nonnull
          ALTER TABLE tracks ADD COLUMN album_artist TEXT NOT NULL DEFAULT 'Unknown Artist';
          CREATE INDEX IF NOT EXISTS index_track_album_artist ON tracks (album_artist);
        "#,
    backfill_fn: Some(|| Ok(())),
}];

fn run_migrations(db: DB) -> AnyResult<()> {
    Ok(())
}

/** ----------------------------------------------------------------------------
 * Migration Helpers
 * -------------------------------------------------------------------------- */

fn get_track_album_artist(path: &PathBuf) -> Option<String> {
    match lofty::read_from_path(path) {
        Ok(tagged_file) => {
            let tag = tagged_file.primary_tag()?;

            return Some(tag.get_string(&ItemKey::AlbumArtist)?.to_string());
        }
        Err(_) => return None,
    }
}
