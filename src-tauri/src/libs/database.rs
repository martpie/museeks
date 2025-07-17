use indexmap::IndexMap;
use itertools::Itertools;
use serde_json::json;
use sqlx::SqliteConnection;
use std::path::PathBuf;

use super::error::AnyResult;
use super::playlist::Playlist;
use super::track::{Track, TrackGroup};

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
     * Get all the tracks (and their content) from the database
     */
    pub async fn get_all_tracks(&mut self) -> AnyResult<Vec<Track>> {
        let tracks = sqlx::query_as::<_, Track>("SELECT * FROM tracks")
            .fetch_all(&mut self.connection)
            .await?;
        Ok(tracks)
    }

    /**
     * Get tracks (and their content) given a set of document IDs
     */
    pub async fn get_tracks(&mut self, track_ids: &Vec<String>) -> AnyResult<Vec<Track>> {
        if track_ids.is_empty() {
            return Ok(vec![]);
        }

        // Construct `IN` clause with placeholders
        let in_placeholders = track_ids.iter().map(|_| "?").collect::<Vec<_>>().join(", ");

        // Construct `ORDER BY CASE` using bindable expressions like: CASE id WHEN ? THEN 0 ...
        let mut order_by_case = String::from("CASE id ");
        for index in 0..track_ids.len() {
            order_by_case.push_str("WHEN ? THEN ");
            order_by_case.push_str(&index.to_string());
            order_by_case.push(' ');
        }
        order_by_case.push_str("END");

        // Improve me once https://github.com/launchbadge/sqlx/issues/875 is fixed
        let sql = format!(
            "SELECT * FROM tracks WHERE id IN ({}) ORDER BY {}",
            in_placeholders, order_by_case
        );

        // Build query and bind all UUIDs twice (once for IN, once for ORDER BY CASE)
        let mut query = sqlx::query_as::<_, Track>(&sql);

        for id in track_ids {
            query = query.bind(id); // for IN (...)
        }

        for id in track_ids {
            query = query.bind(id); // for ORDER BY CASE
        }

        let tracks = query.fetch_all(&mut self.connection).await?;
        Ok(tracks)
    }

    /**
     * Get tracks (and their content) given a set of document IDs
     */
    pub async fn update_track(&mut self, track: Track) -> AnyResult<Track> {
        sqlx::query(
            r#"
            UPDATE tracks SET
                path = ?,
                title = ?,
                album = ?,
                album_artist = ?,
                artists = ?,
                genres = ?,
                year = ?,
                duration = ?,
                track_no = ?,
                track_of = ?,
                disk_no = ?,
                disk_of = ?
            WHERE id = ?
            "#,
        )
        .bind(&track.path)
        .bind(&track.title)
        .bind(&track.album)
        .bind(&track.album_artist)
        .bind(json!(&track.artists))
        .bind(json!(&track.genres))
        .bind(track.year)
        .bind(track.duration)
        .bind(track.track_no)
        .bind(track.track_of)
        .bind(track.disk_no)
        .bind(track.disk_of)
        .bind(&track.id)
        .execute(&mut self.connection)
        .await?;

        Ok(track)
    }

    /** Delete multiple tracks by ID */
    pub async fn remove_tracks(&mut self, track_ids: &Vec<String>) -> AnyResult<()> {
        let placeholders = track_ids.iter().map(|_| "?").collect::<Vec<_>>().join(", ");
        let query = format!("DELETE FROM tracks WHERE id IN ({})", placeholders);

        let mut query_builder = sqlx::query(&query);

        for id in track_ids {
            query_builder = query_builder.bind(id);
        }

        query_builder.execute(&mut self.connection).await?;

        Ok(())
    }

    /**
     * Insert multiple tracks in the DB, will fail in case there is a duplicate
     * unique key (like track.path)
     */
    pub async fn insert_tracks(&mut self, tracks: Vec<Track>) -> AnyResult<()> {
        // Weirdly, this is fast enough with SQLite, no need to create transactions
        for track in tracks {
            sqlx::query(
                r#"
                INSERT INTO tracks (
                    id, path, title, album, album_artist, artists, genres, year,
                    duration, track_no, track_of, disk_no, disk_of
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                "#,
            )
            .bind(&track.id)
            .bind(&track.path)
            .bind(&track.title)
            .bind(&track.album)
            .bind(&track.album_artist)
            .bind(json!(&track.artists))
            .bind(json!(&track.genres))
            .bind(track.year) // Use i64 for SQL compatibility
            .bind(track.duration)
            .bind(track.track_no)
            .bind(track.track_of)
            .bind(track.disk_no)
            .bind(track.disk_of)
            .execute(&mut self.connection)
            .await?;
        }

        Ok(())
    }

    /**
     * Update a list of tracks in the database by just overriding everything
     */
    pub async fn update_tracks(&mut self, tracks: Vec<Track>) -> AnyResult<()> {
        for track in tracks {
            self.update_track(track).await?;
        }

        Ok(())
    }

    /**
     * Get the list of artist registered in the database.
     * Only fetches the first artist for each row.
     */
    pub async fn get_artists(&mut self) -> AnyResult<Vec<String>> {
        let result: Vec<String> = sqlx::query_scalar(
            "SELECT DISTINCT album_artist FROM tracks ORDER BY album_artist COLLATE NOCASE;",
        )
        .fetch_all(&mut self.connection)
        .await?;

        Ok(result)
    }

    /**
     * Get the list of artist registered in the database.
     * Only fetches the first artist for each row.
     */
    pub async fn get_artist_tracks(&mut self, artist: String) -> AnyResult<Vec<TrackGroup>> {
        let tracks = sqlx::query_as::<_, Track>(
            "SELECT * FROM tracks WHERE album_artist = ? ORDER BY album, disk_no, track_no",
        )
        .bind(&artist)
        .fetch_all(&mut self.connection)
        .await?;

        let mut groups: IndexMap<String, Vec<Track>> = IndexMap::new();

        for item in tracks {
            groups.entry(item.album.clone()).or_default().push(item);
        }

        let mut track_groups = groups
            .into_iter()
            .map(|(album, tracks)| TrackGroup {
                label: album,
                genres: tracks
                    .iter()
                    .flat_map(|s| &s.genres)
                    .cloned()
                    .unique()
                    .collect(),
                duration: tracks.iter().map(|t| t.duration).sum(),
                year: tracks.first().and_then(|t| t.year),
                tracks,
            })
            .collect::<Vec<TrackGroup>>();

        // Sort by group year, we only use the first track's year and different
        // tracks can have different years. If no year is provided, put the group
        // at the end, as it's probably a library management issue, and we want
        // clean lists!
        track_groups.sort_by_key(|group| group.year.unwrap_or(u32::MAX));

        Ok(track_groups)
    }

    /** Get all the playlists (and their content) from the database */
    pub async fn get_all_playlists(&mut self) -> AnyResult<Vec<Playlist>> {
        let mut playlists = sqlx::query_as::<_, Playlist>("SELECT * FROM playlists ORDER BY name")
            .fetch_all(&mut self.connection)
            .await?;

        // Ensure the playlists are sorted alphabetically (case-insensitive) for better UX
        playlists.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

        Ok(playlists)
    }

    /** Get a single playlist by ID */
    pub async fn get_playlist(&mut self, playlist_id: &String) -> AnyResult<Option<Playlist>> {
        let playlist = sqlx::query_as::<_, Playlist>("SELECT * FROM playlists WHERE id = ?")
            .bind(playlist_id)
            .fetch_optional(&mut self.connection)
            .await?;

        Ok(playlist)
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

        sqlx::query(
            r#"
            INSERT INTO playlists (id, name, tracks, import_path)
            VALUES (?, ?, ?, ?)
            "#,
        )
        .bind(&playlist.id)
        .bind(&playlist.name)
        .bind(json!(&playlist.tracks))
        .bind(&playlist.import_path)
        .execute(&mut self.connection)
        .await?;

        Ok(playlist)
    }

    /** Set the tracks of a playlist given its ID and tracks IDs */
    pub async fn set_playlist_tracks(
        &mut self,
        id: &String,
        tracks: Vec<String>,
    ) -> AnyResult<Playlist> {
        sqlx::query("UPDATE playlists SET tracks = ? WHERE id = ?")
            .bind(json!(&tracks))
            .bind(id)
            .execute(&mut self.connection)
            .await?;

        let playlist = sqlx::query_as::<_, Playlist>("SELECT * FROM playlists WHERE id = ?")
            .bind(id)
            .fetch_one(&mut self.connection)
            .await?;

        Ok(playlist)
    }

    /** Update a playlist name by ID */
    pub async fn rename_playlist(&mut self, id: &String, name: String) -> AnyResult<Playlist> {
        sqlx::query("UPDATE playlists SET name = ? WHERE id = ?")
            .bind(&name)
            .bind(id)
            .execute(&mut self.connection)
            .await?;

        let playlist = sqlx::query_as::<_, Playlist>("SELECT * FROM playlists WHERE id = ?")
            .bind(id)
            .fetch_one(&mut self.connection)
            .await?;

        Ok(playlist)
    }

    /** Delete a playlist by ID */
    pub async fn delete_playlist(&mut self, id: &String) -> AnyResult<()> {
        sqlx::query("DELETE FROM playlists WHERE id = ?")
            .bind(id)
            .execute(&mut self.connection)
            .await?;

        Ok(())
    }
}
