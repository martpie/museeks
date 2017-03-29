import createLib from '../../shared/lib';

const mocks = {
    player: {
        getAudio             : () => Promise.resolve({}),
        play                 : () => Promise.resolve({}),
        pause                : () => Promise.resolve({}),
        stop                 : () => Promise.resolve({}),
        setMetadata          : () => Promise.resolve({}),
        setVolume            : () => Promise.resolve({}),
        mute                 : () => Promise.resolve({}),
        unmute               : () => Promise.resolve({}),
        setPlaybackRate      : () => Promise.resolve({}),
        setCurrentTime       : () => Promise.resolve({}),
        getCurrentTime       : () => Promise.resolve({})
    }
};

const lib = createLib(mocks);

export default lib;
