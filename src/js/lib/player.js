import app from './app';
import utils from '../utils/utils';

class Player {

    constructor(options) {

        const mergedOptions = {
            playbackRate: 1,
            volume: 1,
            muted: false,
            ...options
        };

        this.audio = new Audio();

        this.audio.defaultPlaybackRate = mergedOptions.playbackRate;
        this.audio.playbackRate = mergedOptions.playbackRate;
        this.audio.volume = mergedOptions.volume;
        this.audio.muted = mergedOptions.muted;

        this.threshold = .75;
        this.durationThresholdReached = false;
    }

    play() {
        this.audio.play();
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

    setAudioVolume(volume) {
        this.audio.volume = volume;
    }

    setAudioPlaybackRate(playbackRate) {
        this.audio.playbackRate = playbackRate;
        this.audio.defaultPlaybackRate = playbackRate;
    }

    setAudioSrc(src) {
        // When we change song, need to update the thresholdReached indicator.
        this.durationThresholdReached = false;
        this.audio.src = src;
    }

    setAudioCurrentTime(currentTime) {
        this.audio.currentTime = currentTime;
    }

    isThresholdReached() {
        if(! this.durationThresholdReached && this.audio.currentTime >= this.audio.duration * this.threshold) {
            this.durationThresholdReached = true;
            return this.durationThresholdReached;
        }
    }

    getCurrentTrackMetadata(cb) {
        const path = decodeURI(this.getAudio().src).replace('file://', '');
        utils.getMetadata(path, cb);
    }
}

export default new Player({
    volume       : app.config.get('audioVolume'),
    playbackRate : app.config.get('audioPlaybackRate'),
    muted        : app.config.get('audioMuted')
});
