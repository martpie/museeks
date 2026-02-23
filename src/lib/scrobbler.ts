/**
 * Scrobbler service
 * Handles Last.fm scrobbling logic according to the Last.fm specifications:
 * - Update "Now Playing" when a track starts
 * - Scrobble when track has been played for at least:
 *   - 50% of the track duration OR
 *   - 4 minutes (whichever comes first)
 * - Tracks must be longer than 30 seconds to be scrobbled
 */

import type { Track } from '../generated/typings';
import LastfmBridge from './bridge-lastfm';
import player from './player';

const MIN_SCROBBLE_DURATION = 30; // seconds
const SCROBBLE_TIME_THRESHOLD = 240; // 4 minutes in seconds

interface ScrobbleState {
  track: Track | null;
  startTime: number | null;
  startTimestamp: number | null; // Unix timestamp
  hasScrobbled: boolean;
  scrobbleTimeReached: boolean;
}

class Scrobbler {
  private state: ScrobbleState = {
    track: null,
    startTime: null,
    startTimestamp: null,
    hasScrobbled: false,
    scrobbleTimeReached: false,
  };

  /**
   * Initialize the scrobbler and attach event listeners to the player
   */
  init() {
    // When a new track starts playing
    player.on('trackChange', this.handleTrackChange.bind(this));

    // Monitor playback time
    player.on('timeupdate', this.handleTimeUpdate.bind(this));

    // Handle playback stop/pause
    player.on('pause', this.handlePause.bind(this));
    player.on('stop', this.handleStop.bind(this));
    player.on('ended', this.handleEnded.bind(this));
  }

  /**
   * Handle track change - update Now Playing
   */
  private handleTrackChange(track: Track | null) {
    // Reset state for new track
    this.state = {
      track,
      startTime: null,
      startTimestamp: null,
      hasScrobbled: false,
      scrobbleTimeReached: false,
    };

    if (!track) {
      return;
    }

    // Don't scrobble tracks shorter than 30 seconds
    if (track.duration < MIN_SCROBBLE_DURATION) {
      return;
    }

    // Record when playback started
    this.state.startTime = Date.now();
    this.state.startTimestamp = Math.floor(Date.now() / 1000);

    // Update Now Playing on Last.fm
    this.updateNowPlaying(track);
  }

  /**
   * Handle time updates - check if we should scrobble
   */
  private handleTimeUpdate(currentTime: number) {
    if (!this.state.track || this.state.hasScrobbled || !this.state.startTime) {
      return;
    }

    const track = this.state.track;
    const playedDuration = currentTime;

    // Calculate scrobble threshold
    // Scrobble at 50% of track duration OR 4 minutes, whichever comes first
    const halfDuration = track.duration / 2;
    const scrobbleThreshold = Math.min(halfDuration, SCROBBLE_TIME_THRESHOLD);

    // Check if we've reached the scrobble point
    if (playedDuration >= scrobbleThreshold && !this.state.scrobbleTimeReached) {
      this.state.scrobbleTimeReached = true;
      this.scrobbleTrack(track);
    }
  }

  /**
   * Handle pause - mark as scrobbled if we've reached the threshold
   */
  private handlePause() {
    // If we've reached the scrobble time but haven't scrobbled yet (edge case)
    if (
      this.state.track &&
      this.state.scrobbleTimeReached &&
      !this.state.hasScrobbled
    ) {
      this.scrobbleTrack(this.state.track);
    }
  }

  /**
   * Handle stop - reset state
   */
  private handleStop() {
    this.state = {
      track: null,
      startTime: null,
      startTimestamp: null,
      hasScrobbled: false,
      scrobbleTimeReached: false,
    };
  }

  /**
   * Handle track ended - scrobble if we haven't already
   */
  private handleEnded() {
    if (
      this.state.track &&
      !this.state.hasScrobbled &&
      this.state.track.duration >= MIN_SCROBBLE_DURATION
    ) {
      // Track ended naturally, scrobble it if we haven't already
      this.scrobbleTrack(this.state.track);
    }
  }

  /**
   * Update "Now Playing" status on Last.fm
   */
  private async updateNowPlaying(track: Track) {
    const artist = track.artists[0] || track.album_artist || 'Unknown Artist';
    const title = track.title || 'Unknown Title';
    const album = track.album || undefined;
    const duration = track.duration;

    await LastfmBridge.nowPlaying(artist, title, album, duration);
  }

  /**
   * Scrobble the track to Last.fm
   */
  private async scrobbleTrack(track: Track) {
    if (this.state.hasScrobbled || !this.state.startTimestamp) {
      return;
    }

    this.state.hasScrobbled = true;

    const artist = track.artists[0] || track.album_artist || 'Unknown Artist';
    const title = track.title || 'Unknown Title';
    const album = track.album || undefined;
    const duration = track.duration;
    const timestamp = this.state.startTimestamp;

    await LastfmBridge.scrobble(artist, title, timestamp, album, duration);
  }
}

// Create singleton instance
const scrobbler = new Scrobbler();

export default scrobbler;
