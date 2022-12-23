import { ipcRenderer } from 'electron';

import { debounce } from 'lodash-es';
import history from '../../lib/history';
import store from '../store';
import { PlayerState } from '../reducers/player';

import types from '../action-types';
import SORT_ORDERS from '../../constants/sort-orders';

import { sortTracks, filterTracks } from '../../lib/utils-library';
import { shuffleTracks } from '../../lib/utils-player';
import { TrackModel, PlayerStatus, Repeat } from '../../../shared/types/museeks';
import channels from '../../../shared/lib/ipc-channels';
import logger from '../../../shared/lib/logger';
import * as ToastsActions from './ToastsActions';
import * as LibraryActions from './LibraryActions';

const AUDIO_ERRORS = {
  aborted: 'The video playback was aborted.',
  corrupt: 'The audio playback was aborted due to a corruption problem.',
  notFound: 'The track file could not be found. It may be due to a file move or an unmounted partition.',
  unknown: 'An unknown error occurred.',
};

/**
 * Play/resume audio
 */
export const play = async (): Promise<void> => {
  await window.__museeks.player.play();
  store.dispatch({
    type: types.PLAYER_PLAY,
  });
};

/**
 * Pause audio
 */
export const pause = (): void => {
  window.__museeks.player.pause();
  store.dispatch({
    type: types.PLAYER_PAUSE,
  });
};

/**
 * Start playing audio (queue instantiation, shuffle and everything...)
 * TODO: this function ~could probably~ needs to be refactored ~a bit~
 */
export const start = async (queue?: TrackModel[], _id?: string): Promise<void> => {
  const state = store.getState();

  let newQueue = queue ? [...queue] : null;

  // Check if there's already a queue planned
  if (newQueue === null && state.player.queue !== null) {
    newQueue = state.player.queue;
  }

  const { pathname } = history.location;

  // If no queue is provided, we create it based on the screen the user is on
  if (!newQueue) {
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

      newQueue = sortTracks(filterTracks(newQueue, search), SORT_ORDERS[sort.by][sort.order]);
    }
  }

  const { shuffle } = state.player;

  const oldQueue = [...newQueue];
  const trackId = _id || newQueue[0]._id;

  // Typically, if we are in the playlists generic view without any view selected
  if (newQueue.length === 0) return;

  const queuePosition = newQueue.findIndex((track) => track._id === trackId);

  // If a track exists
  if (queuePosition > -1) {
    const track = newQueue[queuePosition];

    window.__museeks.player.setTrack(track);
    await window.__museeks.player.play();

    let queueCursor = queuePosition; // Clean that variable mess later

    // Check if we have to shuffle the queue
    if (shuffle) {
      // Shuffle the tracks
      newQueue = shuffleTracks(newQueue, queueCursor);
      // Let's set the cursor to 0
      queueCursor = 0;
    }

    // Determine the queue origin in case the user wants to jump to the current
    // track
    let queueOrigin: PlayerState['queueOrigin'] = null;

    if (pathname.indexOf('/playlists') === 0) {
      queueOrigin = pathname;
    } else {
      queueOrigin = '/library';
    }

    store.dispatch({
      type: types.PLAYER_START,
      payload: {
        queue: newQueue,
        queueOrigin,
        oldQueue,
        queueCursor,
      },
    });
  }
};

/**
 * Toggle play/pause
 */
export const playPause = async (): Promise<void> => {
  const { paused } = window.__museeks.player.getAudio();
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
export const stop = (): void => {
  window.__museeks.player.stop();
  store.dispatch({
    type: types.PLAYER_STOP,
  });

  ipcRenderer.send(channels.PLAYBACK_STOP);
};

/**
 * Jump to the next track
 */
export const next = async (): Promise<void> => {
  // TODO (y.solovyov | martpie): calling getState is a hack.
  const { queue, queueCursor, repeat } = store.getState().player;
  let newQueueCursor;

  if (queueCursor !== null) {
    if (repeat === Repeat.ONE) {
      newQueueCursor = queueCursor;
    } else if (repeat === Repeat.ALL && queueCursor === queue.length - 1) {
      // is last track
      newQueueCursor = 0; // start with new track
    } else {
      newQueueCursor = queueCursor + 1;
    }

    const track = queue[newQueueCursor];

    // tslint:disable-next-line strict-type-predicates
    if (track !== undefined) {
      window.__museeks.player.setTrack(track);
      await window.__museeks.player.play();
      store.dispatch({
        type: types.PLAYER_NEXT,
        payload: {
          newQueueCursor,
        },
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
export const previous = async (): Promise<void> => {
  const currentTime = window.__museeks.player.getCurrentTime();

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
      window.__museeks.player.setTrack(newTrack);
      await window.__museeks.player.play();

      store.dispatch({
        type: types.PLAYER_PREVIOUS,
        payload: {
          currentTime,
          newQueueCursor,
        },
      });
    } else {
      stop();
    }
  }
};

/**
 * Enable/disable shuffle
 */
export const shuffle = (value: boolean): void => {
  window.__museeks.config.set('audioShuffle', value);
  window.__museeks.config.save();

  store.dispatch({
    type: types.PLAYER_SHUFFLE,
    payload: {
      shuffle: value,
    },
  });
};

/**
 * Enable disable repeat
 */
export const repeat = (value: Repeat): void => {
  window.__museeks.config.set('audioRepeat', value);
  window.__museeks.config.save();

  store.dispatch({
    type: types.PLAYER_REPEAT,
    payload: {
      repeat: value,
    },
  });
};

/**
 * Set volume
 */
export const setVolume = (volume: number): void => {
  window.__museeks.player.setVolume(volume);

  saveVolume(volume);
};

const saveVolume = debounce((volume: number) => {
  window.__museeks.config.set('audioVolume', volume);
  window.__museeks.config.save();

  store.dispatch({
    type: types.REFRESH_CONFIG,
  });
}, 500);

/**
 * Mute/unmute the audio
 */
export const setMuted = (muted = false): void => {
  if (muted) window.__museeks.player.mute();
  else window.__museeks.player.unmute();

  window.__museeks.config.set('audioMuted', muted);
  window.__museeks.config.save();

  store.dispatch({
    type: types.REFRESH_CONFIG,
  });
};

/**
 * Set audio's playback rate
 */
export const setPlaybackRate = (value: number): void => {
  if (value >= 0.5 && value <= 5) {
    // if in allowed range
    window.__museeks.player.setPlaybackRate(value);

    window.__museeks.config.set('audioPlaybackRate', value);
    window.__museeks.config.save();

    store.dispatch({
      type: types.REFRESH_CONFIG,
    });
  }
};

/**
 * Set audio's output device
 */
export const setOutputDevice = (deviceId = 'default'): void => {
  if (deviceId) {
    try {
      window.__museeks.player
        .setOutputDevice(deviceId)
        .then(() => {
          window.__museeks.config.set('audioOutputDevice', deviceId);
          window.__museeks.config.save();
        })
        .catch((err) => {
          throw err;
        });
    } catch (err) {
      logger.warn(err);
      ToastsActions.add('danger', 'An error occured when trying to switch to the new output device');
    }
  }
};

/**
 * Jump to a time in the track
 */
export const jumpTo = (to: number): void => {
  // TODO (y.solovyov) do we want to set some explicit state?
  // if yes, what should it be? if not, do we need this actions at all?
  window.__museeks.player.setCurrentTime(to);
  store.dispatch({
    type: types.PLAYER_JUMP_TO,
  });
};

/**
 * Toggle play/pause
 */
export const jumpToPlayingTrack = async (): Promise<void> => {
  const queueOrigin = store.getState().player.queueOrigin ?? '/library';
  history.push(queueOrigin);

  LibraryActions.highlightPlayingTrack(true);
};

/**
 * Handle audio errors
 */
export const audioError = (e: ErrorEvent): void => {
  stop();

  const element = e.target as HTMLAudioElement;

  if (element) {
    const { error } = element;

    if (!error) return;

    switch (error.code) {
      case error.MEDIA_ERR_ABORTED:
        ToastsActions.add('warning', AUDIO_ERRORS.aborted);
        break;
      case error.MEDIA_ERR_DECODE:
        ToastsActions.add('danger', AUDIO_ERRORS.corrupt);
        break;
      case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        ToastsActions.add('danger', AUDIO_ERRORS.notFound);
        break;
      default:
        ToastsActions.add('danger', AUDIO_ERRORS.unknown);
        break;
    }
  }
};
