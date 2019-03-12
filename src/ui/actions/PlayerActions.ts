import * as electron from 'electron';

import history from '../router/history';
import store from '../store';

import types from '../constants/action-types';
import SORT_ORDERS from '../constants/sort-orders';

import * as ToastsActions from './ToastsActions';

import * as app from '../lib/app';
import * as utils from '../utils/utils';
import Player from '../lib/player';
import { sortTracks, filterTracks } from '../utils/utils-library';
import { shuffleTracks } from '../utils/utils-player';
import { TrackModel, PlayerStatus, Repeat } from '../../shared/types/interfaces';

const { ipcRenderer } = electron;

const AUDIO_ERRORS = {
  aborted: 'The video playback was aborted.',
  corrupt: 'The audio playback was aborted due to a corruption problem.',
  notFound: 'The track file could not be found. It may be due to a file move or an unmounted partition.',
  unknown: 'An unknown error occurred.'
};

/**
 * Play/resume audio
 */
export const play = async () => {
  await Player.play();
  store.dispatch({
    type: types.PLAYER_PLAY
  });
};

/**
 * Pause audio
 */
export const pause = () => {
  Player.pause();
  store.dispatch({
    type: types.PLAYER_PAUSE
  });
};

/**
 * Start playing audio (queue instantiation...
 * TODO this function could probably be refactored a bit)
 */
export const start = async (queue?: TrackModel[], _id?: string) => {
  const state = store.getState();

  let newQueue = queue ? [...queue] : null;

  // If no queue is provided, let's search it from the store
  if (!newQueue) {
    const { pathname } = history.location;

    if (pathname.indexOf('/playlists') === 0) {
      newQueue = state.library.tracks.playlist;
    } else {
      // we are either on the library or the settings view
      // so let's play the whole library
      // Because the tracks in the store are not ordered, let's filter
      // and sort everything
      const { library } = state;
      const { sort, search } = library;
      newQueue = state.library.tracks.library;

      newQueue = sortTracks(
        filterTracks(newQueue, search),
        SORT_ORDERS[sort.by][sort.order]
      );
    }
  }

  const { shuffle } = state.player;

  const oldQueue = [...newQueue];
  const trackId = _id || newQueue[0]._id;

  // Typically, if we are in the playlists generic view without any view selected
  if (newQueue.length === 0) return;

  const queuePosition = newQueue.findIndex(track => track._id === trackId);

  // If a track exists
  if (queuePosition > -1) {
    const uri = utils.parseUri(newQueue[queuePosition].path);

    Player.setAudioSrc(uri);
    await Player.play();

    let queueCursor = queuePosition; // Clean that variable mess later

    // Check if we have to shuffle the queue
    if (shuffle) {
      // Shuffle the tracks
      newQueue = shuffleTracks(newQueue, queueCursor);
      // Let's set the cursor to 0
      queueCursor = 0;
    }

    store.dispatch({
      type: types.PLAYER_START,
      payload: {
        queue: newQueue,
        oldQueue,
        queueCursor
      }
    });
  }
};

/**
 * Toggle play/pause
 */
export const playPause = async () => {
  const { paused } = Player.getAudio();
  // TODO (y.solovyov | martpie): calling getState is a hack.
  const { queue, playerStatus } = store.getState().player;

  if (playerStatus === PlayerStatus.STOP) {
    await start();
  } else if (paused && queue.length > 0) {
    await play();
  } else {
    pause();
  }
};

/**
 * Stop the player
 */
export const stop = () => {
  Player.stop();
  store.dispatch({
    type: types.PLAYER_STOP
  });

  ipcRenderer.send('playback:stop');
};

/**
 * Jump to the next track
 */
export const next = async () => {
  // TODO (y.solovyov | martpie): calling getState is a hack.
  const { queue, queueCursor, repeat } = store.getState().player;
  let newQueueCursor;

  if (queueCursor !== null) {
    if (repeat === Repeat.ONE) {
      newQueueCursor = queueCursor;
    } else if (repeat === Repeat.ALL && queueCursor === queue.length - 1) { // is last track
      newQueueCursor = 0; // start with new track
    } else {
      newQueueCursor = queueCursor + 1;
    }

    const track = queue[newQueueCursor];

    // tslint:disable-next-line strict-type-predicates
    if (track !== undefined) {
      const uri = utils.parseUri(track.path);

      Player.setAudioSrc(uri);
      await Player.play();
      store.dispatch({
        type: types.PLAYER_NEXT,
        payload: {
          newQueueCursor
        }
      });
    } else {
      stop();
    }
  }
};

/**
 * Jump to the previous track, or restart the current track after a certain
 * treshold
 */
export const previous = async () => {
  const currentTime = Player.getCurrentTime();

  // TODO (y.solovyov | martpie): calling getState is a hack.
  const { queue, queueCursor } = store.getState().player;
  let newQueueCursor = queueCursor;

  if (queueCursor !== null && newQueueCursor !== null) {
    // If track started less than 5 seconds ago, play th previous track,
    // otherwise replay the current one
    if (currentTime < 5) {
      newQueueCursor = queueCursor - 1;
    }

    const newTrack = queue[newQueueCursor];

    // tslint:disable-next-line
    if (newTrack !== undefined) {
      const uri = utils.parseUri(newTrack.path);

      Player.setAudioSrc(uri);
      await Player.play();

      store.dispatch({
        type: types.PLAYER_PREVIOUS,
        payload: {
          currentTime,
          newQueueCursor
        }
      });
    } else {
      stop();
    }
  }
};

/**
 * Enable/disable shuffle
 */
export const shuffle = (value: boolean) => {
  app.config.set('audioShuffle', value);
  app.config.save();

  store.dispatch({
    type: types.PLAYER_SHUFFLE,
    payload: {
      shuffle: value
    }
  });
};

/**
 * Enable disable repeat
 */
export const repeat = (value: Repeat) => {
  app.config.set('audioRepeat', value);
  app.config.save();

  store.dispatch({
    type: types.PLAYER_REPEAT,
    payload: {
      repeat: value
    }
  });
};

/**
 * Set volume
 */
export const setVolume = (volume: number) => {
  Player.setAudioVolume(volume);

  app.config.set('audioVolume', volume);
  app.config.save();

  store.dispatch({
    type: types.REFRESH_CONFIG
  });
};

/**
 * Mute/unmute the audio
 */
export const setMuted = (muted = false) => {
  if (muted) Player.mute();
  else Player.unmute();

  app.config.set('audioMuted', muted);
  app.config.save();

  store.dispatch({
    type: types.REFRESH_CONFIG
  });
};

/**
 * Set audio's playback rate
 */
export const setPlaybackRate = (value: number) => {
  if (value >= 0.5 && value <= 5) { // if in allowed range
    Player.setAudioPlaybackRate(value);

    app.config.set('audioPlaybackRate', value);
    app.config.save();

    store.dispatch({
      type: types.REFRESH_CONFIG
    });
  }
};

/**
 * Set audio's output device
 */
export const setOutputDevice = (deviceId: string = 'default') => {
  if (deviceId) {
    try {
      Player.setOutputDevice(deviceId)
        .then(() => {
          app.config.set('audioOutputDevice', deviceId);
          app.config.save();
        })
        .catch(err => { throw err; });
    } catch (err) {
      console.warn(err);
      ToastsActions.add('danger', 'An error occured when trying to switch to the new output device');
    }
  }
};

/**
 * Jump to a time in the track
 */
export const jumpTo = (to: number) => {
  // TODO (y.solovyov) do we want to set some explicit state?
  // if yes, what should it be? if not, do we need this actions at all?
  Player.setAudioCurrentTime(to);
  store.dispatch({
    type: types.PLAYER_JUMP_TO
  });
};

/**
 * Handle audio errors
 */
export const audioError = (e: ErrorEvent) => {
  stop();

  if (e.target) {
    // @ts-ignore TODO e.target is not detected as HTMLAudioElement
    switch (e.target.error.code) {
      // @ts-ignore TODO
      case e.target.error.MEDIA_ERR_ABORTED:
        ToastsActions.add('warning', AUDIO_ERRORS.aborted);
        break;
        // @ts-ignore TODO
      case e.target.error.MEDIA_ERR_DECODE:
        ToastsActions.add('danger', AUDIO_ERRORS.corrupt);
        break;
        // @ts-ignore TODO
      case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        ToastsActions.add('danger', AUDIO_ERRORS.notFound);
        break;
      default:
        ToastsActions.add('danger', AUDIO_ERRORS.unknown);
        break;
    }
  }
};
