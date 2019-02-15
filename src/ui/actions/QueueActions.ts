import store from '../store';
import types from '../constants/action-types';

import * as app from '../lib/app';
import Player from '../lib/player';
import * as utils from '../utils/utils';

import { Track } from '../../shared/types/interfaces';

/**
 * Start audio playback from the queue
 */
export const start = async (index: number) => {
  const { queue } = store.getState().player;
  const uri = utils.parseUri(queue[index].path);

  Player.setAudioSrc(uri);
  await Player.play();

  store.dispatch({
    type: types.QUEUE_START,
    payload: {
      index
    }
  });
};

/**
 * Clear the queue
 */
export const clear = () => {
  store.dispatch({
    type: types.QUEUE_CLEAR
  });
};

/**
 * Remove track from queue
 */
export const remove = (index: number) => {
  store.dispatch({
    type: types.QUEUE_REMOVE,
    payload: {
      index
    }
  });
};

/**
 * Add tracks at the end of the queue
 */
export const addAfter = async (tracksIds: string[]) => {
  const tracks = await app.models.Track.findAsync({ _id: { $in: tracksIds } });
  store.dispatch({
    type: types.QUEUE_ADD,
    payload: {
      tracks
    }
  });
};

/**
 * Add tracks at the beginning of the queue
 */
export const addNext = async (tracksIds: string[]) => {
  const tracks = await app.models.Track.findAsync({ _id: { $in: tracksIds } });
  store.dispatch({
    type: types.QUEUE_ADD_NEXT,
    payload: {
      tracks
    }
  });
};

/**
 * Set the queue
 */
export const setQueue = (tracks: Track[]) => {
  store.dispatch({
    type: types.QUEUE_SET_QUEUE,
    payload: {
      tracks
    }
  });
};
