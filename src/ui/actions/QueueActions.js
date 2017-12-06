import store from '../store.js';
import types  from '../constants/action-types';

import * as app from '../lib/app';
import Player from '../lib/player';
import utils from '../utils/utils';


const start = (index) => {
  // TODO (y.solovyov | KeitIG): calling getState is a hack.
  const { queue } = store.getState().player;
  const uri = utils.parseUri(queue[index].path);
  Player.setAudioSrc(uri);
  Player.play();

  store.dispatch({
    type : types.APP_QUEUE_START,
    index,
  });
};

const clear = () => {
  store.dispatch({
    type : types.APP_QUEUE_CLEAR,
  });
};

const remove = (index) => {
  store.dispatch({
    type : types.APP_QUEUE_REMOVE,
    index,
  });
};

const add = async (tracksIds) => {
  const tracks = await app.models.Track.findAsync({ _id: { $in: tracksIds } });
  store.dispatch({
    type : types.APP_QUEUE_ADD,
    tracks,
  });
};

const addNext = async (tracksIds) => {
  const tracks = await app.models.Track.findAsync({ _id: { $in: tracksIds } });
  store.dispatch({
    type : types.APP_QUEUE_ADD_NEXT,
    tracks,
  });
};

const setQueue = (tracks) => {
  store.dispatch({
    type : types.APP_QUEUE_SET_QUEUE,
    tracks,
  });
};


export default{
  add,
  addNext,
  clear,
  remove,
  start,
  setQueue,
};
