import { convertFileSrc } from '@tauri-apps/api/core';
import EventEmitter from 'eventemitter3';

import type { Track } from '../generated/typings';
import ConfigBridge from './bridge-config';
import { getCover } from './cover';

interface PlayerOptions {
  playbackRate?: number;
  audioOutputDevice?: string;
  volume?: number;
  muted?: boolean;
}

/**
 * Events emitted by the Player
 */
export interface PlayerEvents {
  play: () => void;
  pause: () => void;
  ended: () => void;
  error: (error: MediaError) => void;
  timeupdate: (currentTime: number) => void;
  loadstart: () => void;
}

/**
 * Library in charge of playing audio. Currently uses HTMLAudioElement.
 * Emits events for playback state changes.
 */
class Player extends EventEmitter<PlayerEvents> {
  private readonly audio: HTMLAudioElement;
  private track: Track | null;
  private blobUrl: string | null;

  constructor(options?: PlayerOptions) {
    super();

    const mergedOptions = {
      playbackRate: 1,
      volume: 1,
      muted: false,
      ...options,
    };

    this.audio = new Audio();
    this.track = null;
    this.blobUrl = null;

    this.audio.defaultPlaybackRate = mergedOptions.playbackRate;
    this.audio.playbackRate = mergedOptions.playbackRate;
    this.audio.volume = mergedOptions.volume;
    this.audio.muted = mergedOptions.muted;

    this.setupMediaSession();
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
  }

  /**
   * Sync current track metadata with MediaSession API
   */
  private async syncMediaSession() {
    if (!('mediaSession' in navigator) || !('MediaMetadata' in globalThis)) {
      return;
    }

    const track = this.track;
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

  async play() {
    if (!this.audio.src)
      throw new Error('Trying to play a track but not audio.src is defined');

    await this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  stop() {
    this.audio.pause();
  }

  mute() {
    this.audio.muted = true;
  }

  unmute() {
    this.audio.muted = false;
  }

  getAudio() {
    return this.audio;
  }

  getCurrentTime() {
    return this.audio.currentTime;
  }

  getVolume() {
    return this.audio.volume;
  }

  setVolume(volume: number) {
    this.audio.volume = volume;
  }

  setPlaybackRate(playbackRate: number) {
    this.audio.playbackRate = playbackRate;
    this.audio.defaultPlaybackRate = playbackRate;
  }

  getTrack() {
    return this.track;
  }

  async setTrack(track: Track) {
    this.track = track;

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
      return;
    }

    this.audio.src = convertFileSrc(track.path);
  }

  setCurrentTime(currentTime: number) {
    this.audio.currentTime = currentTime;
  }

  isMuted() {
    return this.audio.muted;
  }

  isPaused() {
    return this.audio.paused;
  }
}

/**
 * Export a singleton by default, for the sake of simplicity (and we only need
 * one anyway)
 */

const playerInstance = new Player({
  volume: ConfigBridge.getInitial('audio_volume'),
  playbackRate: ConfigBridge.getInitial('audio_playback_rate') ?? 1,
  muted: ConfigBridge.getInitial('audio_muted'),
});

export default playerInstance;

// Expose for debugging
window.__MUSEEKS_PLAYER = playerInstance;
