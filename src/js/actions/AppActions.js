import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';

import remote from 'remote';



export default {

    /**
     * Refresh the library
     */
    refreshLibrary: function() {
        AppDispatcher.dispatch({
            actionType : AppConstants.APP_REFRESH_LIBRARY
        });
    },

    /**
     * Select and play a track
     */
    selectAndPlay: function(id, noReplay) {

        AppDispatcher.dispatch({
            actionType : AppConstants.APP_SELECT_AND_PLAY,
            id         : id,
            noReplay   : noReplay
        });
    },

    /**
     * Search
     */
    filterSearch: function(search) {

        AppDispatcher.dispatch({
            actionType : AppConstants.APP_FILTER_SEARCH,
            search     : search
        });
    },

    app: {

        close: function() {
            remote.getCurrentWindow().close();
        }
    },

    player: {

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

        repeat: function() {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_PLAYER_REPEAT
            });
        }
    },

    queue: {

        clear: function() {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_QUEUE_CLEAR
            });
        },

        remove: function(index) {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_QUEUE_REMOVE,
                index      : index
            });
        },

        add: function(selected) {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_QUEUE_ADD,
                selected   : selected
            });
        },

        addNext: function(selected) {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_QUEUE_ADD_NEXT,
                selected   : selected
            });
        },

        setPlaylist: function(playlist) {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_QUEUE_SET_PLAYLIST,
                playlist   : playlist
            });
        }
    },

    library: {

        addFolders(folders) {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_LIBRARY_ADD_FOLDERS,
            });
        },

        removeFolder(index) {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_LIBRARY_REMOVE_FOLDER,
                index      : index
            });
        },

        reset() {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_LIBRARY_RESET,
                index      : index
            });
        },

        refresh() {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_LIBRARY_REFRESH
            });
        }
    }
};
