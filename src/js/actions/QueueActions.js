import store from '../store.js';
import AppConstants  from '../constants/AppConstants';

import app from '../lib/app';
import Player from '../lib/player';


const selectAndPlay = (index) => {
    // TODO (y.solovyov | KeitIG): calling getState is a hack.
    const { queue } = store.getState();
    const uri = utils.parseUri(queue[index].path);
    Player.setAudioSrc(uri);
    Player.play();

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

const add = async (tracksIds) => {
    const tracks = await app.models.Track.findAsync({ _id: { $in: tracksIds } });
    store.dispatch({
        type : AppConstants.APP_QUEUE_ADD,
        tracks
    });
};

const addNext = async (tracksIds) => {
    const tracks = await app.models.Track.findAsync({ _id: { $in: tracksIds } });
    store.dispatch({
        type : AppConstants.APP_QUEUE_ADD_NEXT,
        tracks
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
