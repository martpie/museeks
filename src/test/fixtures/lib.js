import createLib from '../../shared/lib';

const mocks = {
    player: {
        getAudio             : (data) => data,
        play                 : (data) => data,
        pause                : (data) => data,
        stop                 : (data) => data,
        setMetadata          : (data) => data,
        setVolume            : (data) => data,
        mute                 : (data) => data,
        unmute               : (data) => data,
        setPlaybackRate      : (data) => data,
        setCurrentTime       : (data) => data,
        getCurrentTime       : (data) => data
    }
};

const lib = createLib(mocks);

export default lib;
