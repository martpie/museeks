import { rpc } from 'electron-simple-rpc';

export default {
    play                 : rpc('main-renderer', 'player.play'),
    pause                : rpc('main-renderer', 'player.pause'),
    stop                 : rpc('main-renderer', 'player.stop'),
    mute                 : rpc('main-renderer', 'player.mute'),
    unmute               : rpc('main-renderer', 'player.unmute'),
    getCurrentTime       : rpc('main-renderer', 'player.getCurrentTime'),
    getVolume            : rpc('main-renderer', 'player.getVolume'),
    getSrc               : rpc('main-renderer', 'player.getSrc'),
    setVolume            : rpc('main-renderer', 'player.setVolume'),
    setPlaybackRate      : rpc('main-renderer', 'player.setPlaybackRate'),
    setAudioSrc          : rpc('main-renderer', 'player.setAudioSrc'),
    setAudioCurrentTime  : rpc('main-renderer', 'player.setAudioCurrentTime'),
    isMuted              : rpc('main-renderer', 'player.isMuted'),
    isPaused             : rpc('main-renderer', 'player.isPaused'),
    isThresholdReached   : rpc('main-renderer', 'player.isThresholdReached'),
    link                 : rpc('main-renderer', 'player.link'),
};
