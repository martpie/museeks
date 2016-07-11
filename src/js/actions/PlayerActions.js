import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';

import NotificationsActions from './NotificationsActions';

import app from '../utils/app';



export default {

    toggle: function() {
        AppDispatcher.dispatch({
            actionType : AppConstants.APP_PLAYER_TOGGLE
        });
    },

    play: function() {
        AppDispatcher.dispatch({
            actionType : AppConstants.APP_PLAYER_PLAY
        });
    },

    pause: function() {
        AppDispatcher.dispatch({
            actionType : AppConstants.APP_PLAYER_PAUSE
        });
    },

    stop: function() {
        AppDispatcher.dispatch({
            actionType : AppConstants.APP_PLAYER_STOP
        });
    },

    next: function(e) {
        AppDispatcher.dispatch({
            actionType : AppConstants.APP_PLAYER_NEXT,
            e          : e
        });
    },

    previous: function() {
        AppDispatcher.dispatch({
            actionType : AppConstants.APP_PLAYER_PREVIOUS
        });
    },

    shuffle: function() {
        AppDispatcher.dispatch({
            actionType : AppConstants.APP_PLAYER_SHUFFLE
        });
    },

    setVolume: function(volume) {

        if(!isNaN(parseFloat(volume)) && isFinite(volume)) {
            app.audio.volume = volume;
            app.config.set('audioVolume', volume);
            app.config.saveSync();
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_REFRESH_CONFIG
            });
        }
    },

    setPlaybackRate: function(value) {

        if(!isNaN(parseFloat(value)) && isFinite(value)) { // if is numeric

            if(value >= 0.5 && value <= 5) { // if in allowed range

                app.audio.playbackRate = value;
                app.config.set('audioPlaybackRate', parseFloat(value));
                app.config.saveSync();
                AppDispatcher.dispatch({
                    actionType : AppConstants.APP_REFRESH_CONFIG
                });
            }
        }
    },

    repeat: function() {
        AppDispatcher.dispatch({
            actionType : AppConstants.APP_PLAYER_REPEAT
        });
    },

    jumpTo: function(to) {
        AppDispatcher.dispatch({
            actionType : AppConstants.APP_PLAYER_JUMP_TO,
            to         : to
        });
    },

    audioError: function(e) {

        switch (e.target.error.code) {
            case e.target.error.MEDIA_ERR_ABORTED:
                NotificationsActions.add('warning', 'The video playback was aborted.');
                break;
            case e.target.error.MEDIA_ERR_DECODE:
                NotificationsActions.add('danger', 'The audio playback was aborted due to a corruption problem.');
                break;
            case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                NotificationsActions.add('danger', 'The track file could not be found. It may be due to a file move or an unmounted partition.')
                break;
            default:
                NotificationsActions.add('danger', 'An unknown error occurred.')
                break;
        }
    }
}
