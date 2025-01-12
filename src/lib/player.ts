import { convertFileSrc } from '@tauri-apps/api/core';

import type { Track } from '../generated/typings';

import config from './config';
import { logAndNotifyError } from './utils';

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
  private audio: HTMLAudioElement;
  private track: Track | null;

  constructor(options?: PlayerOptions) {
    const mergedOptions = {
      playbackRate: 1,
      volume: 1,
      muted: false,
      audioOutputDevice: 'default',
      ...options,
    };

    this.audio = new Audio();
    this.track = null;

    this.audio.defaultPlaybackRate = mergedOptions.playbackRate;
    // @ts-ignore
    // TODO:
    // this.audio.setSinkId(mergedOptions.audioOutputDevice);
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

  async setOutputDevice(deviceID: string) {
    try {
      // @ts-ignore
      await this.audio.setSinkId(deviceID);
    } catch (err) {
      logAndNotifyError(err);
    }
  }

  getTrack() {
    return this.track;
  }

  async setTrack(track: Track) {
    this.track = track;

    // Cursed Linux: https://github.com/tauri-apps/tauri/issues/3725#issuecomment-2325248116
    if (window.__SYNCUDIO_PLATFORM === 'linux') {
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
  volume: config.getInitial('audio_volume'),
  playbackRate: config.getInitial('audio_playback_rate') ?? 1,
  audioOutputDevice: config.getInitial('audio_output_device'),
  muted: config.getInitial('audio_muted'),
});
