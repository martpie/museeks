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

        const dispatch = this.lib.store.dispatch;
        const { config } = this.lib.store.getState();

        this.setVolume(config.volume);
        this.setPlaybackRate(config.playbackRate);
        this.setMuted(config.muted);

//        this.audio.addEventListener('play',  () => dispatch(this.lib.actions.player.play()));
//        this.audio.addEventListener('pause', () => dispatch(this.lib.actions.player.pause()));
        this.audio.addEventListener('ended', () => dispatch(this.lib.actions.player.next()));
        this.audio.addEventListener('error', () => dispatch(this.lib.actions.player.audioError()));
        this.audio.addEventListener('timeupdate', this.tick);
    }

    tick = () => {
        if (this.isThresholdReached()) {
            this.lib.store.dispatch(this.lib.actions.tracks.incrementPlayCount(this.getMetadata()._id));
        }
    }

    setPlaybackRate = (playbackRate) => {
        this.audio.playbackRate = playbackRate;
        this.audio.defaultPlaybackRate = playbackRate;
    }

    play = () => {
        this.audio.play();
        this.lib.tray.setContextMenu('play');
    }

    pause = () => {
        this.audio.pause();
        this.lib.tray.setContextMenu('pause');
    }

    stop = () => {
        this.lib.tray.setContextMenu('pause');
        this.audio.pause();
    }

    setMetadata = (metadata) => {
        this.metadata = metadata;

        this.lib.tray.updateTrayMetadata(metadata);
        this.lib.tray.setContextMenu('play');

        const peerEndpoint = this.lib.utils.peerEndpoint(metadata.owner);
        const src = new URL('/api/track/download', peerEndpoint);
        src.searchParams.append('_id', metadata._id);
        this.audio.src = src;

        // when we change song, we need to update the thresholdReached indicator
        this.durationThresholdReached = false;
    }

    isThresholdReached() {
        if (!this.durationThresholdReached && this.audio.currentTime >= this.audio.duration * this.threshold) {
            this.durationThresholdReached = true;
            return this.durationThresholdReached;
        }
    }

    getAudio = () => Promise.resolve(this.audio);

    setCurrentTime = (currentTime) => this.audio.currentTime = currentTime

    isMuted = () => this.audio.muted

    isPaused = () => this.audio.paused

    setMuted = (status) => this.audio.muted = status

    mute = () => this.audio.muted = true

    unmute = () => this.audio.muted = false

    getCurrentTime = () => this.audio.currentTime

    getVolume = () => this.audio.volume

    getSrc = () => this.audio.src

    getMetadata = () => this.metadata

    setVolume = (volume) => this.audio.volume = volume
}

export default Player;
