use serde::{Deserialize, Serialize};
use std::fmt;
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export, export_to = "../src/generated/typings/IPCEvent.ts")]
pub enum IPCEvent {
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
    JumpToPlayingTrack,
}

impl fmt::Display for IPCEvent {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}
