import rpcWrap from '../../shared/modules/rpc';

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
    'isThresholdReached'
];

export default rpcWrap('playlist', functions, 'mainRenderer');
