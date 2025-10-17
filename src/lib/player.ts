import { convertFileSrc } from '@tauri-apps/api/core';
import EventEmitter from 'eventemitter3';
import debounce from 'lodash-es/debounce';

import type { Repeat, Track } from '../generated/typings';
import type { QueueOrigin } from '../types/museeks';
import ConfigBridge from './bridge-config';
import { getCover } from './cover';
import { logAndNotifyError } from './utils';
import { shuffleTracks } from './utils-player';

interface PlayerOptions {
  playbackRate?: number;
  volume?: number;
  muted?: boolean;
  repeat?: Repeat;
  shuffle?: boolean;
}

/**
 * Player state that gets emitted on changes
 */
export interface PlayerState {
  queue: Track[];
  queueCursor: number | null;
  queueOrigin: QueueOrigin | null;
  repeat: Repeat;
  shuffle: boolean;
  volume: number;
  muted: boolean;
  isPaused: boolean;
}

/**
 * Events emitted by the Player
 */
export interface PlayerEvents {
  // Playback events
  play: () => void;
  pause: () => void;
  stop: () => void;
  ended: () => void;
  error: (error: MediaError) => void;
  timeupdate: (currentTime: number) => void;
  loadstart: () => void;

  // State change event (for React hooks)
  stateChange: (state: PlayerState) => void;

  // Track change event
  trackChange: (track: Track | null) => void;
}

/**
 * Enhanced Player class that manages both audio playback and queue state.
 * Extends EventEmitter to notify React components of state changes.
 */
class Player extends EventEmitter<PlayerEvents> {
  private readonly audio: HTMLAudioElement;
  private blobUrl: string | null;

  // Queue state
  private queue: Track[];
  private oldQueue: Track[]; // Backup for shuffle/unshuffle
  private queueCursor: number | null;
  private queueOrigin: QueueOrigin | null;

  // Playback modes
  private repeat: Repeat;
  private shuffle: boolean;

  // Cached state for useSyncExternalStore
  private state: PlayerState | null = null;

  constructor(options?: PlayerOptions) {
    super();

    const mergedOptions = {
      playbackRate: 1,
      volume: 1,
      muted: false,
      repeat: 'None' as Repeat,
      shuffle: false,
      ...options,
    };

    this.audio = new Audio();
    this.blobUrl = null;
    this.queue = [];
    this.oldQueue = [];
    this.queueCursor = null;
    this.queueOrigin = null;
    this.repeat = mergedOptions.repeat;
    this.shuffle = mergedOptions.shuffle;

    this.audio.defaultPlaybackRate = mergedOptions.playbackRate;
    this.audio.playbackRate = mergedOptions.playbackRate;
    this.audio.volume = mergedOptions.volume;
    this.audio.muted = mergedOptions.muted;

    this.setupAudioListeners();
    this.setupMediaSession();

    // Bind methods that are used as callbacks
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.playPause = this.playPause.bind(this);
    this.previous = this.previous.bind(this);
    this.next = this.next.bind(this);
    this.stop = this.stop.bind(this);
    this.start = this.start.bind(this);
    this.startFromQueue = this.startFromQueue.bind(this);
    this.addToQueue = this.addToQueue.bind(this);
    this.addNextInQueue = this.addNextInQueue.bind(this);
    this.removeFromQueue = this.removeFromQueue.bind(this);
    this.clearQueue = this.clearQueue.bind(this);
    this.setQueue = this.setQueue.bind(this);
    this.toggleShuffle = this.toggleShuffle.bind(this);
    this.toggleRepeat = this.toggleRepeat.bind(this);
    this.setTrack = this.setTrack.bind(this);
    this.setCurrentTime = this.setCurrentTime.bind(this);
    this.setVolume = this.setVolume.bind(this);
    this.toggleMute = this.toggleMute.bind(this);
    this.setPlaybackRate = this.setPlaybackRate.bind(this);
  }

  /**
   * Setup internal audio element event listeners
   */
  private setupAudioListeners() {
    this.audio.addEventListener('play', () => {
      this.emit('play');
      this.emitStateChange();
    });

    this.audio.addEventListener('pause', () => {
      this.emit('pause');
      this.emitStateChange();
    });

    this.audio.addEventListener('ended', async () => {
      this.emit('ended');
      // Auto-advance to next track
      await this.next();
    });

    this.audio.addEventListener('error', () => {
      if (this.audio.error) {
        this.emit('error', this.audio.error);
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      this.emit('timeupdate', this.audio.currentTime);
    });

    this.audio.addEventListener('loadstart', () => {
      this.emit('loadstart');
    });

    // Emit volume changes
    this.audio.addEventListener('volumechange', () => {
      this.emitStateChange();
    });
  }

  /**
   * Setup MediaSession integration (for OS media controls, MPRIS, etc.)
   */
  private setupMediaSession() {
    if (!('mediaSession' in navigator)) {
      return;
    }

    // Update playback state when audio plays
    this.audio.addEventListener('play', () => {
      navigator.mediaSession.playbackState = 'playing';
    });

    // Update playback state when audio pauses
    this.audio.addEventListener('pause', () => {
      navigator.mediaSession.playbackState = 'paused';
    });

    // Sync metadata when track loads
    this.audio.addEventListener('loadstart', async () => {
      await this.syncMediaSession();
    });

    // Setup action handlers
    navigator.mediaSession.setActionHandler('play', () => {
      this.play().catch(logAndNotifyError);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      this.pause();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      this.previous().catch(logAndNotifyError);
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      this.next().catch(logAndNotifyError);
    });
  }

  /**
   * Sync current track metadata with MediaSession API
   */
  private async syncMediaSession() {
    if (!('mediaSession' in navigator) || !('MediaMetadata' in globalThis)) {
      return;
    }

    const track = this.getTrack();
    if (!track) {
      return;
    }

    const cover = await getCover(track.path);

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artists.join(', '),
      album: track.album,
      artwork: cover ? [{ src: cover }] : undefined,
    });
  }

  /**
   * Emit state change event for React hooks
   */
  private emitStateChange() {
    // Invalidate cache when state changes
    this.state = null;
    this.emit('stateChange', this.getState());
  }

  /**
   * Get current player state snapshot with caching for useSyncExternalStore.
   * Returns the same reference when called multiple times without state changes.
   */
  getState(): PlayerState {
    // Return cached state if available
    if (this.state !== null) {
      return this.state;
    }

    // Create new state object
    this.state = {
      queue: [...this.queue],
      queueCursor: this.queueCursor,
      queueOrigin: this.queueOrigin,
      repeat: this.repeat,
      shuffle: this.shuffle,
      volume: this.audio.volume,
      muted: this.audio.muted,
      isPaused: this.audio.paused,
    };

    return this.state;
  }

  // ============================================================================
  // Playback controls
  // ============================================================================

  async play() {
    if (!this.audio.src) {
      throw new Error('Trying to play a track but no audio.src is defined');
    }

    await this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  stop() {
    this.audio.pause();

    // Revoke blob URL if it exists
    if (this.blobUrl !== null) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }

    this.queue = [];
    this.queueCursor = null;
    this.queueOrigin = null;
    this.emit('stop');
    this.emitStateChange();
  }

  async playPause() {
    try {
      if (this.audio.paused && this.queue.length > 0) {
        await this.play();
      } else {
        this.pause();
      }
    } catch (error) {
      logAndNotifyError(error);
    }
  }

  /**
   * Jump to next track in queue
   */
  async next() {
    if (this.queueCursor === null) {
      return;
    }

    let newQueueCursor: number;

    if (this.repeat === 'One') {
      newQueueCursor = this.queueCursor;
    } else if (
      this.repeat === 'All' &&
      this.queueCursor === this.queue.length - 1
    ) {
      // Last track with repeat all -> go to first
      newQueueCursor = 0;
    } else {
      newQueueCursor = this.queueCursor + 1;
    }

    const track = this.queue[newQueueCursor];

    if (track !== undefined) {
      this.queueCursor = newQueueCursor;
      await this.setTrack(track);
      await this.play();
    } else {
      this.stop();
    }
  }

  /**
   * Jump to previous track, or restart current track if > 5 seconds
   */
  async previous() {
    if (this.queueCursor === null) {
      return;
    }

    let newQueueCursor = this.queueCursor;

    // If track started less than 5 seconds ago, play the previous track
    if (this.audio.currentTime < 5) {
      newQueueCursor = this.queueCursor - 1;
    }

    const track = this.queue[newQueueCursor];

    if (track !== undefined) {
      this.queueCursor = newQueueCursor;
      await this.setTrack(track);
      await this.play();
    } else {
      this.stop();
    }
  }

  // ============================================================================
  // Queue management
  // ============================================================================

  /**
   * Start playing a new queue
   */
  async start(
    tracks: Track[],
    trackID: string | null,
    queueOrigin: QueueOrigin,
  ) {
    if (tracks.length === 0) {
      return;
    }

    const targetTrackID = trackID ?? tracks[0].id;
    const queuePosition = tracks.findIndex((t) => t.id === targetTrackID);

    if (queuePosition === -1) {
      return;
    }

    let queue = [...tracks];
    let queueCursor = queuePosition;
    const oldQueue = [...tracks];

    // Apply shuffle if enabled
    if (this.shuffle) {
      queue = shuffleTracks(queue, queueCursor);
      queueCursor = 0;
    }

    this.queue = queue;
    this.oldQueue = oldQueue;
    this.queueCursor = queueCursor;
    this.queueOrigin = queueOrigin;

    const track = queue[queueCursor];
    await this.setTrack(track);
    await this.play().catch(logAndNotifyError);
  }

  /**
   * Start playing from a specific position in the current queue
   */
  async startFromQueue(index: number) {
    const track = this.queue[index];
    if (!track) {
      return;
    }

    this.queueCursor = index;
    await this.setTrack(track);
    await this.play();
  }

  /**
   * Add tracks to the end of the queue
   */
  addToQueue(tracks: Track[]) {
    this.queue = [...this.queue, ...tracks];

    // If queue was empty, set cursor to 0
    if (this.queueCursor === null && tracks.length > 0) {
      this.queueCursor = 0;
    }

    this.emitStateChange();
  }

  /**
   * Add tracks after the currently playing track
   */
  addNextInQueue(tracks: Track[]) {
    if (this.queueCursor === null) {
      this.queue = tracks;
      this.queueCursor = 0;
    } else {
      this.queue.splice(this.queueCursor + 1, 0, ...tracks);
    }

    this.emitStateChange();
  }

  /**
   * Remove a track from the queue
   */
  removeFromQueue(index: number) {
    if (this.queueCursor === null) {
      return;
    }

    // Convert relative index to absolute
    const absoluteIndex = this.queueCursor + index + 1;
    this.queue.splice(absoluteIndex, 1);
    this.emitStateChange();
  }

  /**
   * Clear all tracks after the current one
   */
  clearQueue() {
    if (this.queueCursor === null) {
      return;
    }

    this.queue = this.queue.slice(0, this.queueCursor + 1);
    this.emitStateChange();
  }

  /**
   * Set the entire queue (used for reordering)
   */
  setQueue(tracks: Track[]) {
    this.queue = tracks;
    this.emitStateChange();
  }

  /**
   * Get the current queue
   */
  getQueue(): Track[] {
    return [...this.queue];
  }

  /**
   * Get queue cursor
   */
  getQueueCursor(): number | null {
    return this.queueCursor;
  }

  /**
   * Get queue origin
   */
  getQueueOrigin(): QueueOrigin | null {
    return this.queueOrigin;
  }

  // ============================================================================
  // Shuffle & Repeat
  // ============================================================================

  /**
   * Toggle shuffle mode
   */
  async toggleShuffle() {
    const nextShuffleState = !this.shuffle;

    if (this.queueCursor === null) {
      this.shuffle = nextShuffleState;
      this.emitStateChange();
      await ConfigBridge.set('audio_shuffle', nextShuffleState);
      return;
    }

    const trackPlayingID = this.queue[this.queueCursor].id;

    if (nextShuffleState) {
      // Enable shuffle
      const newQueue = shuffleTracks([...this.queue], this.queueCursor);
      this.oldQueue = this.queue;
      this.queue = newQueue;
      this.queueCursor = 0;
    } else {
      // Disable shuffle - restore original order
      const currentTrackIndex = this.oldQueue.findIndex(
        (track) => track.id === trackPlayingID,
      );
      this.queue = [...this.oldQueue];
      this.queueCursor = currentTrackIndex;
    }

    this.shuffle = nextShuffleState;
    this.emitStateChange();
    await ConfigBridge.set('audio_shuffle', nextShuffleState);
  }

  /**
   * Toggle repeat mode (cycles through None -> All -> One -> None)
   */
  async toggleRepeat() {
    let nextRepeatState: Repeat = 'None';

    // Cycle through modes
    switch (this.repeat) {
      case 'None':
        nextRepeatState = 'All';
        break;
      case 'All':
        nextRepeatState = 'One';
        break;
      case 'One':
        nextRepeatState = 'None';
        break;
    }

    this.repeat = nextRepeatState;
    this.emitStateChange();
    await ConfigBridge.set('audio_repeat', nextRepeatState);
  }

  /**
   * Get shuffle state
   */
  getShuffle(): boolean {
    return this.shuffle;
  }

  /**
   * Get repeat state
   */
  getRepeat(): Repeat {
    return this.repeat;
  }

  // ============================================================================
  // Track management
  // ============================================================================

  async setTrack(track: Track) {
    // Revoke previous blob URL if it exists to prevent memory leaks
    if (this.blobUrl !== null) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }

    // Cursed Linux: https://github.com/tauri-apps/tauri/issues/3725#issuecomment-2325248116
    if (window.__MUSEEKS_PLATFORM === 'linux') {
      this.blobUrl = URL.createObjectURL(
        await fetch(convertFileSrc(track.path)).then((res) => res.blob()),
      );
      this.audio.src = this.blobUrl;
    } else {
      this.audio.src = convertFileSrc(track.path);
    }

    this.emit('trackChange', track);
    this.emitStateChange();
  }

  /**
   * Get the currently playing track (from queue at cursor position)
   */
  getTrack(): Track | null {
    if (this.queue.length > 0 && this.queueCursor !== null) {
      return this.queue[this.queueCursor];
    }
    return null;
  }

  // ============================================================================
  // Audio controls
  // ============================================================================

  setCurrentTime(time: number) {
    this.audio.currentTime = time;
  }

  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  setVolume(volume: number) {
    this.audio.volume = volume;
    this.emitStateChange();
    this.saveVolumeDebounced(volume);
  }

  /**
   * Debounced volume save to avoid too many writes to config
   */
  private readonly saveVolumeDebounced = debounce(async (volume: number) => {
    await ConfigBridge.set('audio_volume', volume);
  }, 500);

  getVolume(): number {
    return this.audio.volume;
  }

  async toggleMute() {
    this.audio.muted = !this.audio.muted;
    this.emitStateChange();
    await ConfigBridge.set('audio_muted', this.audio.muted);
  }

  isMuted(): boolean {
    return this.audio.muted;
  }

  isPaused(): boolean {
    return this.audio.paused;
  }

  async setPlaybackRate(rate: number) {
    // Validate range
    if (!Number.isNaN(rate) && rate >= 0.5 && rate <= 5) {
      this.audio.playbackRate = rate;
      this.audio.defaultPlaybackRate = rate;
      this.emitStateChange();
      await ConfigBridge.set('audio_playback_rate', rate);
    } else {
      this.audio.playbackRate = 1.0;
      this.audio.defaultPlaybackRate = 1.0;
      this.emitStateChange();
      await ConfigBridge.set('audio_playback_rate', null);
    }
  }

  getPlaybackRate(): number {
    return this.audio.playbackRate;
  }
}

/**
 * Create and export singleton player instance
 */
const playerInstance = new Player({
  volume: ConfigBridge.getInitial('audio_volume'),
  playbackRate: ConfigBridge.getInitial('audio_playback_rate') ?? 1,
  muted: ConfigBridge.getInitial('audio_muted'),
  repeat: ConfigBridge.getInitial('audio_repeat'),
  shuffle: ConfigBridge.getInitial('audio_shuffle'),
});

export default playerInstance;

// Expose for debugging
window.__MUSEEKS_PLAYER = playerInstance;
