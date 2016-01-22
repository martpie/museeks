import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';

import app from '../constants/app.js';



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
        app.audio.volume = volume;
        app.config.set('volume', volume);
        app.config.saveSync();
        AppDispatcher.dispatch({
            actionType : AppConstants.APP_REFRESH_CONFIG
        });
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
    }
}
