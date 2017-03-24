import { rpc } from 'electron-simple-rpc';

export default {
    getAudio              : rpc('main-renderer', 'player.getAudio'),
    play                  : rpc('main-renderer', 'player.play'),
    pause                 : rpc('main-renderer', 'player.pause'),
    stop                  : rpc('main-renderer', 'player.stop'),
    setMetadata           : rpc('main-renderer', 'player.setMetadata'),
    setVolume             : rpc('main-renderer', 'player.setVolume'),
    mute                  : rpc('main-renderer', 'player.mute'),
    unmute                : rpc('main-renderer', 'player.unmute'),
    setPlaybackRate       : rpc('main-renderer', 'player.setPlaybackRate'),
    setCurrentTime        : rpc('main-renderer', 'player.setCurrentTime')
};
