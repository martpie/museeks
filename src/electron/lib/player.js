const { rpcWrap } = require('../../shared/modules/rpc');

const functions = [
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
    'isThresholdReached',
    'link'
];

module.exports = rpcWrap('playlist', functions, 'main-renderer');
