const AppConstants = require('../constants/AppConstants');
const utils        = require( '../../utils/utils');
//import app from '../lib/app';
//import Player from '../lib/player';

const start = (index) => (dispatch, getState) => {
    // TODO (y.solovyov | KeitIG): calling getState is a hack.
    const { queue } = getState();
    const uri = utils.parseUri(queue[index].path);
    Player.setAudioSrc(uri);
    Player.play();

    return {
        type : 'APP_QUEUE_START',
        index
    };
};

const clear = () => {
    return {
        type : 'APP_QUEUE_CLEAR'
    };
};

const remove = (index) => {
    return {
        type : 'APP_QUEUE_REMOVE',
        index
    };
};

const add = (tracksIds) => {
    return {
        type : 'APP_QUEUE_ADD',
        payload : app.models.Track.findAsync({ _id: { $in: tracksIds } })
    };
};

const addNext = (tracksIds) => {
    return {
        type : 'APP_QUEUE_ADD_NEXT',
        payload : app.models.Track.findAsync({ _id: { $in: tracksIds } })
    };
};

const setQueue = (queue) => {
    return {
        type : 'APP_QUEUE_SET_QUEUE',
        queue
    };
};


module.exports = {
    add,
    addNext,
    clear,
    remove,
    start,
    setQueue
};
