import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';

import app from '../utils/app';


export default {

    selectAndPlay: function(index) {
        AppDispatcher.dispatch({
            actionType : AppConstants.APP_QUEUE_PLAY,
            index
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
            index
        });
    },

    add: function(tracksIds) {
        app.db.find({ type: 'track', _id: { $in: tracksIds } }, (err, tracks) => {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_QUEUE_ADD,
                tracks
            });
        });

    },

    addNext: function(tracksIds) {
        app.db.find({ type: 'track', _id: { $in: tracksIds } }, (err, tracks) => {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_QUEUE_ADD_NEXT,
                tracks
            });
        });
    },

    setQueue: function(queue) {
        AppDispatcher.dispatch({
            actionType : AppConstants.APP_QUEUE_SET_QUEUE,
            queue
        });
    }
};
