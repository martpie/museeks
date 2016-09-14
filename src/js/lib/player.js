import app from './app';


class Player {

    constructor(options) {

        this.audio = new Audio();

        this.audio.defaultPlaybackRate = options.playbackRate || 1;
        this.audio.playbackRate = options.playbackRate || 1;
        this.audio.volume = options.volume || 1;
        this.audio.muted = options.muted || false;

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
}

export default new Player({
    volume       : app.config.get('audioVolume'),
    playbackRate : app.config.get('audioPlaybackRate'),
    muted        : app.config.get('audioMuted')
});
