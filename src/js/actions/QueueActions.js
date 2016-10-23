import store from '../store.js';
import AppConstants  from '../constants/AppConstants';

import app from '../lib/app';


const selectAndPlay = (index) => {
    store.dispatch({
        type : AppConstants.APP_QUEUE_PLAY,
        index
    });
};

const clear = () => {
    store.dispatch({
        type : AppConstants.APP_QUEUE_CLEAR
    });
};

const remove = (index) => {
    store.dispatch({
        type : AppConstants.APP_QUEUE_REMOVE,
        index
    });
};

const add =  (tracksIds) => {
    app.models.Track.find({ _id: { $in: tracksIds } }, (err, tracks) => {
        store.dispatch({
            type : AppConstants.APP_QUEUE_ADD,
            tracks
        });
    });
};

const addNext = (tracksIds) => {
    app.models.Track.find({ _id: { $in: tracksIds } }, (err, tracks) => {
        store.dispatch({
            type : AppConstants.APP_QUEUE_ADD_NEXT,
            tracks
        });
    });
};

const setQueue = (queue) => {
    store.dispatch({
        type : AppConstants.APP_QUEUE_SET_QUEUE,
        queue
    });
};


export default{
    add,
    addNext,
    clear,
    remove,
    selectAndPlay,
    setQueue
};