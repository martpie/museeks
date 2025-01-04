import { convertFileSrc } from '@tauri-apps/api/core';
import { info } from '@tauri-apps/plugin-log';

import type { PlaybackMode, Track } from '../generated/typings';

import config from './config';
import { logAndNotifyError } from './utils';

interface PlayerOptions {
  playbackRate?: number;
  audioOutputDevice?: string;
  volume?: number;
  muted?: boolean;
  playbackMode: PlaybackMode;
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
  private playbackMode: PlaybackMode;

  constructor(options?: PlayerOptions) {
    const mergedOptions = {
      playbackRate: 1,
      volume: 1,
      muted: false,
      audioOutputDevice: 'default',
      playbackMode: 'Default' as PlaybackMode,
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
    this.playbackMode = mergedOptions.playbackMode;

    info(`Player playback mode: ${this.playbackMode}`);
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

  setPlaybackMode(playbackMode: PlaybackMode) {
    info(`Playback mode set to: ${playbackMode}`);
    this.playbackMode = playbackMode;
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

    switch (this.playbackMode) {
      case 'Default': {
        const blobUrl = URL.createObjectURL(
          await fetch(convertFileSrc(track.path)).then((res) => res.blob()),
        );
        this.audio.src = blobUrl;
        return;
      }
      case 'Blob': {
        this.audio.src = convertFileSrc(track.path);
        return;
      }
    }
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
  playbackMode: config.getInitial('audio_playback_mode'),
});
