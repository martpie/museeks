use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Debug, Clone, TS)]
#[ts(export, export_to = "../src/generated/typings/MuseeksWindowEvent.ts")]
pub enum MuseeksPlaybackEvent {
    // Playback-related events
    PlaybackPlay,
    PlaybackPause,
    PlaybackStop,
    PlaybackPlayPause,
    PlaybackPrevious,
    PlaybackNext,
    PlaybackTrackChange,
    // Menu-related events
    GoToLibrary,
    GoToPlaylists,
    JumpToPlayingTrack,
}
