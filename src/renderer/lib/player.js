import url from 'url';
import utils from '../../shared/utils/utils';
import { URL } from 'url';

class Player {

    constructor() {
        this.audio = new Audio();
        this.threshold = 0.75;
        this.durationThresholdReached = false;
    }

    init(lib) {
        this.lib = lib;

        const { config } = this.lib.store.getState();

        this.setVolume(config.volume);
        this.setPlaybackRate(config.playbackRate);
        this.setMuted(config.muted);

        this.audio.addEventListener('play',  this.lib.actions.player.play);
        this.audio.addEventListener('pause', this.lib.actions.player.pause);
        this.audio.addEventListener('ended', this.lib.actions.player.next);
        this.audio.addEventListener('error', this.lib.actions.player.audioError);
        this.audio.addEventListener('timeupdate', () => {
            if (this.isThresholdReached()) this.lib.actions.library.incrementPlayCount(this.getSrc());
        });
    }

    play() {
        this.audio.play();
        this.lib.tray.setContextMenu('play');
    }

    pause() {
        this.audio.pause();
        this.lib.tray.setContextMenu('pause');
    }

    stop() {
        this.lib.tray.setContextMenu('pause');
        this.audio.pause();
    }

    setMuted(status) {
        this.audio.muted = status;
    }

    mute() {
        this.audio.muted = true;
    }

    unmute() {
        this.audio.muted = false;
    }

    getCurrentTime() {
        return this.audio.currentTime;
    }

    getVolume() {
        return this.audio.volume;
    }

    getSrc() {
        return this.audio.src;
    }

    setVolume(volume) {
        this.audio.volume = volume;
    }

    setPlaybackRate(playbackRate) {
        this.audio.playbackRate = playbackRate;
        this.audio.defaultPlaybackRate = playbackRate;
    }

    setMetadata(metadata) {
        console.log(this.lib)
        this.lib.tray.updateTrayMetadata(metadata);
        this.lib.tray.setContextMenu('play');

        const peerEndpoint = this.lib.utils.peerEndpoint(metadata.peer);
        console.log('peerEndpoint', peerEndpoint)
        const src = new URL('/api/network/download', peerEndpoint);
        src.searchParams.append('_id', metadata._id);
        console.log(src)
        this.audio.src = src;

        // when we change song, we need to update the thresholdReached indicator
        this.durationThresholdReached = false;
    }

    setAudioCurrentTime(currentTime) {
        this.audio.currentTime = currentTime;
    }

    isMuted() {
        return this.audio.muted;
    }

    isPaused() {
        return this.audio.paused;
    }

    isThresholdReached() {
        if (!this.durationThresholdReached && this.audio.currentTime >= this.audio.duration * this.threshold) {
            this.durationThresholdReached = true;
            return this.durationThresholdReached;
        }
    }
}

export default Player;
