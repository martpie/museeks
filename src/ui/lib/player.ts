import * as app from './app';

interface PlayerOptions {
  playbackRate?: number;
  audioOutputDevice?: string;
  volume?: number;
  muted?: boolean;
}

class Player {
  private audio: HTMLAudioElement;
  private durationThresholdReached: boolean;
  public threshold: number;

  constructor (options?: PlayerOptions) {
    const mergedOptions = {
      playbackRate: 1,
      volume: 1,
      muted: false,
      audioOutputDevice: 'default',
      ...options
    };

    this.audio = new Audio();

    this.audio.defaultPlaybackRate = mergedOptions.playbackRate;
    // @ts-ignore
    this.audio.setSinkId(mergedOptions.audioOutputDevice);
    this.audio.playbackRate = mergedOptions.playbackRate;
    this.audio.volume = mergedOptions.volume;
    this.audio.muted = mergedOptions.muted;

    this.threshold = 0.75;
    this.durationThresholdReached = false;
  }

  async play () {
    await this.audio.play();
  }

  pause () {
    this.audio.pause();
  }

  stop () {
    this.audio.pause();
  }

  mute () {
    this.audio.muted = true;
  }

  unmute () {
    this.audio.muted = false;
  }

  getAudio () {
    return this.audio;
  }

  getCurrentTime () {
    return this.audio.currentTime;
  }

  getVolume () {
    return this.audio.volume;
  }

  getSrc () {
    return this.audio.src;
  }

  setAudioVolume (volume: number) {
    this.audio.volume = volume;
  }

  setAudioPlaybackRate (playbackRate: number) {
    this.audio.playbackRate = playbackRate;
    this.audio.defaultPlaybackRate = playbackRate;
  }

  async setOutputDevice (deviceId: string) {
    // @ts-ignore
    await this.audio.setSinkId(deviceId);
  }

  setAudioSrc (src: string) {
    // When we change song, need to update the thresholdReached indicator.
    this.durationThresholdReached = false;
    this.audio.src = src;
  }

  setAudioCurrentTime (currentTime: number) {
    this.audio.currentTime = currentTime;
  }

  isMuted () {
    return this.audio.muted;
  }

  isPaused () {
    return this.audio.paused;
  }

  isThresholdReached () {
    if (!this.durationThresholdReached && this.audio.currentTime >= this.audio.duration * this.threshold) {
      this.durationThresholdReached = true;
    }

    return this.durationThresholdReached;
  }
}

export default new Player({
  volume: app.config.get('audioVolume'),
  playbackRate: app.config.get('audioPlaybackRate'),
  audioOutputDevice: app.config.get('audioOutputDevice'),
  muted: app.config.get('audioMuted')
});
