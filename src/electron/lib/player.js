import lib from '../lib';

const playerFunctions = [
    'play',
    'pause',
    'stop',
    'mute',
    'unmute',
    'getAudio',
    'getCurrentTime',
    'getVolume',
    'getSrc',
    'setAudioVolume',
    'setAudioPlaybackRate',
    'setAudioSrc',
    'setAudioCurrentTime',
    'isMuted',
    'isPaused',
    'isThresholdReached'
];

const library = playerFunctions.reduce((library, fn) => {
    library[fn] = () => {} // do ipc? http? here for main thread to renderer communication
});

return library;
