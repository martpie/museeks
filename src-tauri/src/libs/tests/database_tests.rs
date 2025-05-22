use sqlx::sqlite::SqliteConnectOptions;
use sqlx::{Connection, SqliteConnection, sqlite};
use std::path::PathBuf;

use super::database::DB;
use super::track::Track;

/** ----------------------------------------------------------------------------
 * Test data
 * -------------------------------------------------------------------------- */

fn sample_track_1() -> Track {
    Track {
        id: "1".to_string(),
        path: "/music/artist1/album1/track1.mp3".to_string(),
        title: "Song One".to_string(),
        album: "Album One".to_string(),
        artists: vec!["Artist One".to_string()],
        genres: vec!["Pop".to_string(), "Rock".to_string()],
        year: Some(2023),
        duration: 210,
        track_no: Some(1),
        track_of: Some(10),
        disk_no: Some(1),
        disk_of: Some(1),
    }
}

fn sample_track_2() -> Track {
    Track {
        id: "2".to_string(),
        path: "/music/artist2/album2/track2.mp3".to_string(),
        title: "Song Two".to_string(),
        album: "Album Two".to_string(),
        artists: vec!["Artist Two".to_string()],
        genres: vec!["Jazz".to_string()],
        year: None,
        duration: 180,
        track_no: None,
        track_of: None,
        disk_no: None,
        disk_of: None,
    }
}

fn sample_track_3() -> Track {
    Track {
        id: "3".to_string(),
        path: "/music/artist3/album3/track3.mp3".to_string(),
        title: "Song Three".to_string(),
        album: "Album Three".to_string(),
        artists: vec!["Artist Three".to_string(), "Artist Four".to_string()],
        genres: vec!["Hip-Hop".to_string()],
        year: Some(2022),
        duration: 240,
        track_no: Some(3),
        track_of: Some(12),
        disk_no: Some(1),
        disk_of: Some(2),
    }
}

async fn get_test_db() -> DB {
    let options = SqliteConnectOptions::new()
        .in_memory(true)
        .auto_vacuum(sqlite::SqliteAutoVacuum::Incremental);

    let mut connection = SqliteConnection::connect_with(&options).await.unwrap();

    sqlx::migrate!("src/migrations")
        .run(&mut connection)
        .await
        .expect("Failed to run migrations");

    DB { connection }
}

/** ----------------------------------------------------------------------------
 * Integration Test - Tracks
 * -------------------------------------------------------------------------- */

#[tokio::test]
async fn test_tracks_db() {
    let mut db = get_test_db().await;

    // Table should be empty by default
    let mut all_tracks = db.get_all_tracks().await.unwrap();
    assert!(all_tracks.is_empty());

    // Testing insertion of tracks in the DB
    db.insert_tracks(vec![sample_track_1(), sample_track_2(), sample_track_3()])
        .await
        .unwrap();
    all_tracks = db.get_all_tracks().await.unwrap();
    assert!(all_tracks.len() == 3);

    // Inserting a track with the same ID should fail
    assert!(db.insert_tracks(vec![sample_track_1()]).await.is_err());

    // DB.get_tracks should return the track ordered by IDs, and ignored inexisting tracks
    let mut tracks = db
        .get_tracks(&vec!["3".to_string(), "2".to_string()])
        .await
        .unwrap();
    assert_eq!(tracks, vec![sample_track_3(), sample_track_2()]);

    // Test update
    let mut track_to_update = sample_track_2();
    track_to_update.title = "Song Two Point Five".to_string();
    db.update_track(track_to_update).await.unwrap();
    tracks = db.get_tracks(&vec!["2".to_string()]).await.unwrap();
    assert_eq!(
        tracks,
        vec![Track {
            id: "2".to_string(),
            path: "/music/artist2/album2/track2.mp3".to_string(),
            title: "Song Two Point Five".to_string(),
            album: "Album Two".to_string(),
            artists: vec!["Artist Two".to_string()],
            genres: vec!["Jazz".to_string()],
            year: None,
            duration: 180,
            track_no: None,
            track_of: None,
            disk_no: None,
            disk_of: None,
        }]
    );

    // Test deletion
    db.remove_tracks(&vec!["2".to_string()]).await.unwrap();
    all_tracks = db.get_all_tracks().await.unwrap();
    assert_eq!(all_tracks, vec![sample_track_1(), sample_track_3()]);
}

/** ----------------------------------------------------------------------------
 * Integration Test - Playlists
 * -------------------------------------------------------------------------- */

#[tokio::test]
async fn test_playlists_db() {
    let mut db = get_test_db().await;

    // Tables should be empty by default
    let mut all_playlists = db.get_all_playlists().await.unwrap();
    assert!(all_playlists.is_empty());

    let all_tracks = db.get_all_tracks().await.unwrap();
    assert!(all_tracks.is_empty());
    db.insert_tracks(vec![sample_track_1(), sample_track_2(), sample_track_3()])
        .await
        .unwrap();

    // Test insertion + order
    let playlist_a = db
        .create_playlist(
            "Playlist A".to_string(),
            vec![
                sample_track_1().id,
                sample_track_3().id,
                sample_track_2().id,
                sample_track_1().id,
            ],
            Some(PathBuf::from("/tmp/playlist_a".to_string())),
        )
        .await
        .unwrap();
    db.create_playlist("Playlist b".to_string(), vec![], None)
        .await
        .unwrap();

    all_playlists = db.get_all_playlists().await.unwrap();
    assert_eq!(
        all_playlists
            .into_iter()
            .map(|playlist| playlist.name)
            .collect::<Vec<String>>(),
        vec!["Playlist A".to_string(), "Playlist b".to_string()]
    );

    // Test tracks update
    db.set_playlist_tracks(
        &playlist_a.id,
        vec![sample_track_3().id, sample_track_2().id],
    )
    .await
    .unwrap();
    let mut playlist = db.get_playlist(&playlist_a.id).await.unwrap();
    assert!(playlist.is_some());
    assert_eq!(
        playlist.unwrap().tracks,
        vec!["3".to_string(), "2".to_string()]
    );

    // Test rename
    db.rename_playlist(&playlist_a.id, "My Playlist".to_string())
        .await
        .unwrap();
    playlist = db.get_playlist(&playlist_a.id).await.unwrap();
    assert!(playlist.is_some());
    assert_eq!(playlist.unwrap().name, "My Playlist".to_string());

    // Test deletion
    db.delete_playlist(&playlist_a.id).await.unwrap();
    all_playlists = db.get_all_playlists().await.unwrap();
    assert_eq!(
        all_playlists
            .into_iter()
            .map(|playlist| playlist.name)
            .collect::<Vec<String>>(),
        vec!["Playlist b".to_string()]
    );
}
