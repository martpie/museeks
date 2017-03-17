import { rpcWrap } from '../../shared/modules/rpc';

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

export default rpcWrap('playlist', functions, 'main-renderer');
