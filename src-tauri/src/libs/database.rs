use indexmap::IndexMap;
use ormlite::model::ModelBuilder;
use ormlite::sqlite::SqliteConnection;
use ormlite::{Model, TableMeta};
use std::collections::HashMap;
use std::path::PathBuf;

use super::error::AnyResult;
use super::playlist::Playlist;
use super::track::{Track, TrackGroup};
use super::utils::TimeLogger;

// KEEP THAT IN SYNC with Tauri's file associations in tauri.conf.json
pub const SUPPORTED_TRACKS_EXTENSIONS: [&str; 9] = [
    "mp3", "aac", "m4a", "3gp", "wav", /* mp3 / mp4 */
    "ogg", "opus", /* Opus */
    "flac", /* Flac */
    "weba", /* Web media */
];

pub const SUPPORTED_PLAYLISTS_EXTENSIONS: [&str; 1] = ["m3u"];

/** ----------------------------------------------------------------------------
 * Databases
 * exposes databases for tracks and playlists
 * * -------------------------------------------------------------------------- */

pub struct DB {
    pub connection: SqliteConnection,
}

impl DB {
    /**
     * Create tables within a SQLite connection
     */
    pub async fn create_tables(&mut self) -> AnyResult<()> {
        // TODO: move that to SQL files, or derive that from the struct itself, probably need to create a PR for ormlite-cli
        ormlite::query(
            "CREATE TABLE IF NOT EXISTS tracks (
                id TEXT PRIMARY KEY NOT NULL,
                path TEXT NOT NULL UNIQUE, -- Path as a string and unique
                title TEXT NOT NULL,
                album TEXT NOT NULL,
                artists JSON NOT NULL, -- Array of strings
                genres JSON NOT NULL, -- Array of strings
                year INTEGER,
                duration INTEGER NOT NULL,
                track_no INTEGER,
                track_of INTEGER,
                disk_no INTEGER,
                disk_of INTEGER
            );",
        )
        .execute(&mut self.connection)
        .await?;

        // Index for the path column in Track
        ormlite::query("CREATE INDEX IF NOT EXISTS index_track_path ON tracks (path);")
            .execute(&mut self.connection)
            .await?;

        ormlite::query(
            "CREATE TABLE IF NOT EXISTS playlists (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                tracks JSON NOT NULL DEFAULT '[]', -- Array of track IDs
                import_path TEXT UNIQUE -- Path of the playlist file, unique if it exists
            );",
        )
        .execute(&mut self.connection)
        .await?;

        Ok(())
    }

    /**
     * Get all the tracks (and their content) from the database
     */
    pub async fn get_all_tracks(&mut self) -> AnyResult<Vec<Track>> {
        let timer = TimeLogger::new("Retrieved and decoded tracks".into());
        let tracks = Track::select().fetch_all(&mut self.connection).await?;
        timer.complete();
        Ok(tracks)
    }

    /**
     * Get tracks (and their content) given a set of document IDs
     */
    pub async fn get_tracks(&mut self, track_ids: &Vec<String>) -> AnyResult<Vec<Track>> {
        // TODO: Can this be improved somehow?
        // Improve me once https://github.com/launchbadge/sqlx/issues/875 is fixed
        let placeholders = track_ids.iter().map(|_| "?").collect::<Vec<_>>().join(", ");
        let where_statement = format!("id IN ({})", placeholders);

        let mut query_builder = Track::select().dangerous_where(&where_statement);

        for id in track_ids {
            query_builder = query_builder.bind(id);
        }

        let mut tracks: Vec<Track> = query_builder.fetch_all(&mut self.connection).await?;

        // document may not ordered the way we want, so let's ensure they map to track_ids
        let track_id_positions: HashMap<&String, usize> = track_ids
            .iter()
            .enumerate()
            .map(|(i, id)| (id, i))
            .collect();
        tracks.sort_by_key(|track| track_id_positions.get(&track.id));

        Ok(tracks)
    }

    /**
     * Get tracks (and their content) given a set of document IDs
     */
    pub async fn update_track(&mut self, track: Track) -> AnyResult<Track> {
        let updated_track = track.update_all_fields(&mut self.connection).await?;
        Ok(updated_track)
    }

    /** Delete multiple tracks by ID */
    pub async fn remove_tracks(&mut self, track_ids: &Vec<String>) -> AnyResult<()> {
        // TODO: batch that, use DELETE statement instead
        let tracks = self.get_tracks(track_ids).await?;

        for track in tracks {
            track.delete(&mut self.connection).await?
        }

        Ok(())
    }

    /**
     * Insert a new track in the DB, will fail in case there is a duplicate unique
     * key (like track.path)
     *
     * Doc: https://github.com/khonsulabs/bonsaidb/blob/main/examples/basic-local/examples/basic-local-multidb.rs
     */
    pub async fn insert_tracks(&mut self, tracks: Vec<Track>) -> AnyResult<()> {
        // Weirdly, this is fast enough with SQLite, no need to create transactions
        for track in tracks {
            track.insert(&mut self.connection).await?;
        }

        Ok(())
    }

    /**
     * Get the list of artist registered in the database.
     * Only fetches the first artist for each row.
     */
    pub async fn get_artists(&mut self) -> AnyResult<Vec<String>> {
        let timer = TimeLogger::new("Retrieved artists".into());

        let query = format!(
            "SELECT DISTINCT JSON_EXTRACT({}, '$[0]') FROM {};",
            "artists",
            Track::table_name()
        );

        let mut result: Vec<String> = ormlite::query_as(&query)
            .fetch_all(&mut self.connection)
            .await?
            .into_iter()
            .map(|row: (String,)| row.0)
            .collect();

        // sort them alphabetically
        result.sort_by_key(|a| a.to_lowercase());

        timer.complete();
        Ok(result)
    }

    /**
     * Get the list of artist registered in the database.
     * Only fetches the first artist for each row.
     */
    pub async fn get_artist_tracks(&mut self, artist: String) -> AnyResult<Vec<TrackGroup>> {
        let timer = TimeLogger::new("Retrieved tracks for artist".into());

        let tracks = Track::select()
            .where_bind("JSON_EXTRACT(artists, '$[0]') = ?", &artist)
            .order_asc("album")
            .order_asc("disk_no")
            .order_asc("track_no")
            .fetch_all(&mut self.connection)
            .await?;

        let mut groups: IndexMap<String, Vec<Track>> = IndexMap::new();

        for item in tracks {
            groups.entry(item.album.clone()).or_default().push(item);
        }

        let track_groups = groups
            .into_iter()
            .map(|(album, tracks)| TrackGroup {
                label: album,
                tracks,
            })
            .collect();

        timer.complete();
        Ok(track_groups)
    }

    /** Get all the playlists (and their content) from the database */
    pub async fn get_all_playlists(&mut self) -> AnyResult<Vec<Playlist>> {
        let timer = TimeLogger::new("Retrieved playlists".into());
        let mut playlists = Playlist::select()
            .order_asc("name")
            .fetch_all(&mut self.connection)
            .await?;

        // Ensure the playlists are sorted alphabetically (case-insensitive) for better UX
        playlists.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

        timer.complete();
        Ok(playlists)
    }

    /** Get a single playlist by ID */
    pub async fn get_playlist(&mut self, playlist_id: &String) -> AnyResult<Option<Playlist>> {
        let playlist = Playlist::select()
            .where_bind("id = ?", playlist_id)
            .fetch_one(&mut self.connection)
            .await?;

        Ok(Some(playlist))
    }

    /** Create a playlist given a name and a set of track IDs */
    pub async fn create_playlist(
        &mut self,
        name: String,
        tracks_ids: Vec<String>,
        import_path: Option<PathBuf>,
    ) -> AnyResult<Playlist> {
        let playlist_path: Option<String> =
            import_path.map(|path| path.to_str().unwrap().to_string());

        let playlist = Playlist {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            tracks: tracks_ids,
            import_path: playlist_path,
        };

        let playlist = playlist.insert(&mut self.connection).await?;

        Ok(playlist)
    }

    /** Set the tracks of a playlist given its ID and tracks IDs */
    pub async fn set_playlist_tracks(
        &mut self,
        id: &String,
        tracks: Vec<String>,
    ) -> AnyResult<Playlist> {
        let playlist = Playlist::select()
            .where_bind("id = ?", id)
            .fetch_one(&mut self.connection)
            .await?;

        let updated_playlist = playlist
            .update_partial()
            .tracks(tracks)
            .update(&mut self.connection)
            .await?;

        Ok(updated_playlist)
    }

    /** Update a playlist name by ID */
    pub async fn rename_playlist(&mut self, id: &String, name: String) -> AnyResult<Playlist> {
        let playlist = Playlist::select()
            .where_bind("id = ?", id)
            .fetch_one(&mut self.connection)
            .await?;

        let updated_playlist = playlist
            .update_partial()
            .name(name)
            .update(&mut self.connection)
            .await?;

        Ok(updated_playlist)
    }

    /** Delete a playlist by ID */
    pub async fn delete_playlist(&mut self, id: &String) -> AnyResult<()> {
        let playlist = Playlist::select()
            .where_bind("id = ?", id)
            .fetch_one(&mut self.connection)
            .await?;

        playlist.delete(&mut self.connection).await?;

        Ok(())
    }
}
