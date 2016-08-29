import store from '../store.js';
import AppConstants  from '../constants/AppConstants';

import app from '../lib/app';


export default {

    selectAndPlay: function(index) {
        store.dispatch({
            type : AppConstants.APP_QUEUE_PLAY,
            index
        });
    },

    clear: function() {
        store.dispatch({
            type : AppConstants.APP_QUEUE_CLEAR
        });
    },

    remove: function(index) {
        store.dispatch({
            type : AppConstants.APP_QUEUE_REMOVE,
            index
        });
    },

    add: function(tracksIds) {
        app.models.Track.find({ _id: { $in: tracksIds } }, (err, tracks) => {
            store.dispatch({
                type : AppConstants.APP_QUEUE_ADD,
                tracks
            });
        });

    },

    addNext: function(tracksIds) {
        app.models.Track.find({ _id: { $in: tracksIds } }, (err, tracks) => {
            store.dispatch({
                type : AppConstants.APP_QUEUE_ADD_NEXT,
                tracks
            });
        });
    },

    setQueue: function(queue) {
        store.dispatch({
            type : AppConstants.APP_QUEUE_SET_QUEUE,
            queue
        });
    }
};
