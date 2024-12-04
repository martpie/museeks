// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.

export type Config = { theme: string, audio_volume: number, audio_playback_rate: number | null, audio_output_device: string, audio_muted: boolean, audio_shuffle: boolean, audio_repeat: Repeat, default_view: DefaultView, library_sort_by: SortBy, library_sort_order: SortOrder, library_folders: Array<string>, library_autorefresh: boolean, sleepblocker: boolean, auto_update_checker: boolean, minimize_to_tray: boolean, notifications: boolean, track_view_density: TrackViewDensity, };

export type DefaultView = "Library" | "Playlists";

export type IPCEvent = { "Unknown": string } | "PlaybackPlay" | "PlaybackPause" | "PlaybackStop" | "PlaybackPlayPause" | "PlaybackPrevious" | "PlaybackNext" | "PlaybackStart" | "LibraryScanProgress" | "GoToLibrary" | "GoToPlaylists" | "GoToSettings" | "JumpToPlayingTrack";

/** ----------------------------------------------------------------------------
 * Playlist
 * represent a playlist, that has a name and a list of tracks
 * -------------------------------------------------------------------------- */
export type Playlist = { id: string, name: string, tracks: Array<string>, import_path: string | null, };

export type Repeat = "All" | "One" | "None";

/**
 * Scan progress
 */
export type ScanProgress = { current: number, total: number, };

export type ScanResult = { track_count: number, track_failures: number, playlist_count: number, playlist_failures: number, };

export type SortBy = "Artist" | "Album" | "Title" | "Duration" | "Genre";

export type SortOrder = "Asc" | "Dsc";

/**
 * Track
 * represent a single track, id and path should be unique
 */
export type Track = { id: string, path: string, title: string, album: string, artists: Array<string>, genres: Array<string>, year: number | null, duration: number, track_no: number | null, track_of: number | null, disk_no: number | null, disk_of: number | null, };

/**
 * Represents a group of tracks, grouped by "something", lib artist name, or
 * album name
 */
export type TrackGroup = { label: string, tracks: Array<Track>, };

export type TrackViewDensity = "normal" | "compact";
