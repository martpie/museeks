use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, Clone, TS, strum::Display, strum::AsRefStr)]
#[ts(export, export_to = "../src/generated/typings/IPCEvent.ts")]
pub enum IPCEvent<'a> {
    Unknown(&'a str),
    // Playback-related events
    PlaybackPlay,
    PlaybackPause,
    PlaybackStop,
    PlaybackPlayPause,
    PlaybackPrevious,
    PlaybackNext,
    PlaybackTrackChange,
    // Scan-related events
    LibraryScanProgress,
    // Menu-related events
    GoToLibrary,
    GoToPlaylists,
    GoToSettings,
    JumpToPlayingTrack,
}
