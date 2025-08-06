import { convertFileSrc } from '@tauri-apps/api/core';

import type { Track } from '../generated/typings';
import ConfigBridge from './bridge-config';

interface PlayerOptions {
  playbackRate?: number;
  audioOutputDevice?: string;
  volume?: number;
  muted?: boolean;
}

/**
 * Library in charge of playing audio. Currently uses HTMLAudioElement.
 *
 * Open questions:
 *   - Should it emit IPC events itself? Or expose events?
 *   - Should it hold the concepts of queue/random/etc? (in other words, should
 *     we merge player actions here?)
 */
class Player {
  private readonly audio: HTMLAudioElement;
  private track: Track | null;

  constructor(options?: PlayerOptions) {
    const mergedOptions = {
      playbackRate: 1,
      volume: 1,
      muted: false,
      ...options,
    };

    this.audio = new Audio();
    this.track = null;

    this.audio.defaultPlaybackRate = mergedOptions.playbackRate;
    this.audio.playbackRate = mergedOptions.playbackRate;
    this.audio.volume = mergedOptions.volume;
    this.audio.muted = mergedOptions.muted;
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

    // Cursed Linux: https://github.com/tauri-apps/tauri/issues/3725#issuecomment-2325248116
    if (window.__MUSEEKS_PLATFORM === 'linux') {
      const blobUrl = URL.createObjectURL(
        await fetch(convertFileSrc(track.path)).then((res) => res.blob()),
      );
      this.audio.src = blobUrl;
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

export default new Player({
  volume: ConfigBridge.getInitial('audio_volume'),
  playbackRate: ConfigBridge.getInitial('audio_playback_rate') ?? 1,
  muted: ConfigBridge.getInitial('audio_muted'),
});
