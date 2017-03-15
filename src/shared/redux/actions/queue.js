import AppConstants  from '../constants/AppConstants';

import app from '../lib/app';
import Player from '../lib/player';
import utils from '../../utils/utils';


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
        payload : app.models.Track.findAsync({ _id: { $in: tracksIds } });
    };
};

const setQueue = (queue) => {
    return {
        type : 'APP_QUEUE_SET_QUEUE',
        queue
    };
};


export default{
    add,
    addNext,
    clear,
    remove,
    start,
    setQueue
};
