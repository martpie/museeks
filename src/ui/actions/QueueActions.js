import store from '../store.js';
import types  from '../constants/action-types';

import * as app from '../lib/app';
import Player from '../lib/player';
import * as utils from '../utils/utils';


/**
 * Start audio playback from the queue
 * @param {Number} index index of the track in the queue
 */
export const start = (index) => {
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

/**
 * Clear the queue
 */
export const clear = () => {
  store.dispatch({
    type : types.APP_QUEUE_CLEAR,
  });
};

/**
 * Remove track from queue
 * @param {[type]} index index of the track to be removed
 */
export const remove = (index) => {
  store.dispatch({
    type : types.APP_QUEUE_REMOVE,
    index,
  });
};

/**
 * Add tracks at the end of the queue
 * @param {String[]} tracksIds IDs of the tracks to add
 */
export const addAfter = async (tracksIds) => {
  const tracks = await app.models.Track.findAsync({ _id: { $in: tracksIds } });
  store.dispatch({
    type : types.APP_QUEUE_ADD,
    tracks,
  });
};

/**
 * Add tracks at the beginning of the queue
 * @param {String[]} tracksIds IDs of the tracks to add
 */
export const addNext = async (tracksIds) => {
  const tracks = await app.models.Track.findAsync({ _id: { $in: tracksIds } });
  store.dispatch({
    type : types.APP_QUEUE_ADD_NEXT,
    tracks,
  });
};

/**
 * Set the queue
 * @param {Tracks[]} tracks
 */
export const setQueue = (tracks) => {
  store.dispatch({
    type : types.APP_QUEUE_SET_QUEUE,
    tracks,
  });
};
