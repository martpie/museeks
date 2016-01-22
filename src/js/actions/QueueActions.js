import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';



export default {

    selectAndPlay: function(index) {
        AppDispatcher.dispatch({
            actionType : AppConstants.APP_QUEUE_PLAY,
            index      : index
        });
    },

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
}
