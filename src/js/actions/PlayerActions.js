import store from '../store.js';
import AppConstants  from '../constants/AppConstants';

import ToastsActions from './ToastsActions';

import app from '../lib/app';
import Player from '../lib/player';
import utils from '../utils/utils';

const ipcRenderer    = electron.ipcRenderer;

const audioErrors = {
    aborted:  'The video playback was aborted.',
    corrupt:  'The audio playback was aborted due to a corruption problem.',
    notFound: 'The track file could not be found. It may be due to a file move or an unmounted partition.',
    unknown:  'An unknown error occurred.',
};


const playToggle = () => {
    Player.getAudio().paused ? play() : pause();
};

const play = () => {
    const { queue } = store.getState();
    console.log(queue);
    if(queue !== null) {
        Player.play();
        store.dispatch({
            type : AppConstants.APP_PLAYER_PLAY
        });
    }
};

const pause = () => {
    const { queue } = store.getState();
    console.log(queue);
    if(queue !== null) {
        Player.pause();
        store.dispatch({
            type : AppConstants.APP_PLAYER_PAUSE
        });
    }
};

const stop = () => {
    Player.stop();
    store.dispatch({
        type : AppConstants.APP_PLAYER_STOP
    });

    ipcRenderer.send('playerAction', 'stop');
};

const next = () => {
    const { queue, queueCursor, repeat } = store.getState();
    let newQueueCursor;

    if(repeat === 'one') {
        newQueueCursor = queueCursor;
    } else if (repeat === 'all' && queueCursor === queue.length - 1) { // is last track
        console.log('is last');
        newQueueCursor = 0; // start with new track
    } else {
        newQueueCursor = queueCursor + 1;
    }

    const track = queue[newQueueCursor];

    if (track !== undefined) {
        const uri = utils.parseUri(track.path);

        Player.setAudioSrc(uri);
        Player.play();
        store.dispatch({
            type : AppConstants.APP_PLAYER_NEXT,
            newQueueCursor
        });
    } else {
        stop();
    }
};

const previous = () => {
    const currentTime = Player.getAudio().currentTime;

    const { queue, queueCursor } = store.getState();
    let newQueueCursor = queueCursor;

    // If track started less than 5 seconds ago, play th previous track,
    // otherwise replay the current one
    if (currentTime < 5) {
        newQueueCursor = queueCursor - 1;
    }

    const newTrack = queue[newQueueCursor];

    if (newTrack !== undefined) {
        const uri = utils.parseUri(newTrack.path);

        Player.setAudioSrc(uri);
        Player.play();

        store.dispatch({
            type : AppConstants.APP_PLAYER_PREVIOUS,
            currentTime,
            newQueueCursor,
        });
    } else {
        stop();
    }
};

const shuffle = (shuffle) => {
    app.config.set('audioShuffle', shuffle);
    app.config.saveSync();

    const currentSrc = Player.getAudio().src;
    store.dispatch({
        type : AppConstants.APP_PLAYER_SHUFFLE,
        shuffle,
        currentSrc
    });
};

const repeat = (repeat) => {
    app.config.set('audioRepeat', repeat);
    app.config.saveSync();

    store.dispatch({
        type : AppConstants.APP_PLAYER_REPEAT,
        repeat
    });
};

const setVolume = (volume) => {
    if(!isNaN(parseFloat(volume)) && isFinite(volume)) {
        Player.setAudioVolume(volume);

        app.config.set('audioVolume', volume);
        app.config.saveSync();
        store.dispatch({
            type : AppConstants.APP_REFRESH_CONFIG
        });
    }
};

const setMuted = (muted = false) => {
    if(muted) Player.mute();
    else Player.unmute();

    app.config.set('audioMuted', muted);
    app.config.saveSync();
    store.dispatch({
        type : AppConstants.APP_REFRESH_CONFIG
    });
};

const setPlaybackRate = (value) => {
    if(!isNaN(parseFloat(value)) && isFinite(value)) { // if is numeric
        if(value >= 0.5 && value <= 5) { // if in allowed range
            Player.setAudioPlaybackRate(value);

            app.config.set('audioPlaybackRate', parseFloat(value));
            app.config.saveSync();
            store.dispatch({
                type : AppConstants.APP_REFRESH_CONFIG
            });
        }
    }
};

const jumpTo = (to) => {
    // TODO (y.solovyov) do we want to set some explicit state?
    // if yes, what should it be? if not, do we need this actions at all?
    Player.setAudioCurrentTime(to);
    store.dispatch({
        type : AppConstants.APP_PLAYER_JUMP_TO
    });
};

const audioError = (e) => {
    switch (e.target.error.code) {
        case e.target.error.MEDIA_ERR_ABORTED:
            ToastsActions.add('warning', audioErrors.aborted);
            break;
        case e.target.error.MEDIA_ERR_DECODE:
            ToastsActions.add('danger', audioErrors.corrupt);
            break;
        case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            ToastsActions.add('danger', audioErrors.notFound);
            break;
        default:
            ToastsActions.add('danger', audioErrors.unknown);
            break;
    }
};


export default {
    audioError,
    jumpTo,
    next,
    pause,
    play,
    playToggle,
    previous,
    repeat,
    setMuted,
    setPlaybackRate,
    setVolume,
    shuffle,
    stop,
    audioErrors
};
