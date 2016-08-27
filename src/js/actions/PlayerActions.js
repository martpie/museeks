import store from '../store.js';
import AppConstants  from '../constants/AppConstants';

import NotificationsActions from './NotificationsActions';

import app from '../lib/app';
import Player from '../lib/player';

const ipcRenderer    = electron.ipcRenderer;

const audioErrors = {
    aborted:  'The video playback was aborted.',
    corrupt:  'The audio playback was aborted due to a corruption problem.',
    notFound: 'The track file could not be found. It may be due to a file move or an unmounted partition.',
    unknown:  'An unknown error occurred.',
};


export default {

    playToggle: function() {
        store.dispatch({
            type : AppConstants.APP_PLAYER_TOGGLE
        });
    },

    play: function() {
        store.dispatch({
            type : AppConstants.APP_PLAYER_PLAY
        });
    },

    pause: function() {
        store.dispatch({
            type : AppConstants.APP_PLAYER_PAUSE
        });
    },

    stop: function() {
        store.dispatch({
            type : AppConstants.APP_PLAYER_STOP
        });

        ipcRenderer.send('playerAction', 'stop');
    },

    next: function(e) {
        store.dispatch({
            type : AppConstants.APP_PLAYER_NEXT,
            e
        });
    },

    previous: function() {
        store.dispatch({
            type : AppConstants.APP_PLAYER_PREVIOUS
        });
    },

    shuffle: function() {
        store.dispatch({
            type : AppConstants.APP_PLAYER_SHUFFLE
        });
    },

    setVolume: function(volume) {

        if(!isNaN(parseFloat(volume)) && isFinite(volume)) {

            Player.setAudioVolume(volume);

            app.config.set('audioVolume', Math.pow(volume, 4));
            app.config.saveSync();
            store.dispatch({
                type : AppConstants.APP_REFRESH_CONFIG
            });
        }
    },

    setMuted: function(muted = false) {

        if(muted) Player.mute();
        else Player.unmute();

        app.config.set('audioMuted', muted);
        app.config.saveSync();
        store.dispatch({
            type : AppConstants.APP_REFRESH_CONFIG
        });
    },

    setPlaybackRate: function(value) {

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
    },

    repeat: function() {
        store.dispatch({
            type : AppConstants.APP_PLAYER_REPEAT
        });
    },

    jumpTo: function(to) {
        store.dispatch({
            type : AppConstants.APP_PLAYER_JUMP_TO,
            to
        });
    },

    audioError: function(e) {

        switch (e.target.error.code) {
            case e.target.error.MEDIA_ERR_ABORTED:
                NotificationsActions.add('warning', audioErrors.aborted);
                break;
            case e.target.error.MEDIA_ERR_DECODE:
                NotificationsActions.add('danger', audioErrors.corrupt);
                break;
            case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                NotificationsActions.add('danger', audioErrors.notFound);
                break;
            default:
                NotificationsActions.add('danger', audioErrors.unknown);
                break;
        }
    }
};
