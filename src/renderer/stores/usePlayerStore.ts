import { debounce } from 'lodash-es';
import { ipcRenderer } from 'electron';

import store from '../store/store';
import { PlayerStatus, Repeat, TrackModel } from '../../shared/types/museeks';
import initMediaSession from '../lib/media-session';
import channels from '../../shared/lib/ipc-channels';
import * as LibraryActions from '../store/actions/LibraryActions';
import { filterTracks, sortTracks } from '../lib/utils-library';
import { shuffleTracks } from '../lib/utils-player';
import logger from '../../shared/lib/logger';
import router from '../views/router';
import SORT_ORDERS from '../constants/sort-orders';
import Player from '../lib/player';

import { createStore } from './store-helpers';
import useToastsStore from './useToastsStore';

type PlayerState = {
  instantiated: boolean;
  queue: TrackModel[];
  oldQueue: TrackModel[];
  queueCursor: number | null;
  queueOrigin: null | string;
  repeat: Repeat;
  shuffle: boolean;
  playerStatus: PlayerStatus;
  init: (player: Player) => void;
  start: (queue?: TrackModel[], _id?: string) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  playPause: () => Promise<void>;
  stop: () => void;
  previous: () => Promise<void>;
  next: () => Promise<void>;
  toggleShuffle: (value: boolean) => void;
  toggleRepeat: (value: Repeat) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setPlaybackRate: (value: number) => void;
  setOutputDevice: (deviceId: string) => void;
  jumpTo: (to: number) => void;
  jumpToPlayingTrack: () => Promise<void>;
  startFromQueue: (index: number) => Promise<void>;
  clearQueue: () => void;
  removeFromQueue: (index: number) => void;
  addInQueue: (tracksIds: string[]) => Promise<void>;
  addNextInQueue: (tracksIds: string[]) => Promise<void>;
  setQueue: (tracks: TrackModel[]) => void;
};

const AUDIO_ERRORS = {
  aborted: 'The video playback was aborted.',
  corrupt: 'The audio playback was aborted due to a corruption problem.',
  notFound: 'The track file could not be found. It may be due to a file move or an unmounted partition.',
  unknown: 'An unknown error occurred.',
};

const { player, config } = window.MuseeksAPI;

const usePlayerStore = createStore<PlayerState>((set, get) => ({
  instantiated: false,
  queue: [], // Tracks to be played
  oldQueue: [], // Queue backup (in case of shuffle)
  queueCursor: null, // The cursor of the queue
  queueOrigin: null, // URL of the queue when it was started
  repeat: window.MuseeksAPI.config.getx('audioRepeat'), // the current repeat state (one, all, none)
  shuffle: window.MuseeksAPI.config.getx('audioShuffle'), // If shuffle mode is enabled
  playerStatus: PlayerStatus.STOP, // Player status

  /**
   * Bind various player events to actions. Needs unification at some point
   */
  init: (player: Player) => {
    if (get().instantiated) {
      throw new Error('Player store is already instantiated');
    }

    initMediaSession(player);

    // Bind player events
    // Audio Events
    player.getAudio().addEventListener('ended', get().next);
    player.getAudio().addEventListener('error', handleAudioError);
    player.getAudio().addEventListener('timeupdate', async () => {
      if (player.isThresholdReached()) {
        const track = player.getTrack();
        if (track) await LibraryActions.incrementPlayCount(track._id);
      }
    });

    // How to unify Player, Main process state, and player actions?
    player.getAudio().addEventListener('play', async () => {
      const track = player.getTrack();

      if (!track) throw new Error('Track is undefined');

      ipcRenderer.send(channels.PLAYBACK_PLAY, track ?? null);
      ipcRenderer.send(channels.PLAYBACK_TRACK_CHANGE, track);
    });

    player.getAudio().addEventListener('pause', () => {
      ipcRenderer.send(channels.PLAYBACK_PAUSE);
    });

    // Listen for main-process events
    ipcRenderer.on(channels.PLAYBACK_PLAY, () => {
      if (player.getTrack()) {
        get().play();
      } else {
        get().start();
      }
    });

    ipcRenderer.on(channels.PLAYBACK_PAUSE, () => {
      get().pause();
    });

    ipcRenderer.on(channels.PLAYBACK_PLAYPAUSE, () => {
      get().playPause();
    });

    ipcRenderer.on(channels.PLAYBACK_PREVIOUS, () => {
      get().previous();
    });

    ipcRenderer.on(channels.PLAYBACK_NEXT, () => {
      get().next();
    });

    ipcRenderer.on(channels.PLAYBACK_STOP, () => {
      get().stop();
    });

    set({ instantiated: true });
  },

  /**
   * Start playing audio (queue instantiation, shuffle and everything...)
   * TODO: this function ~could probably~ needs to be refactored ~a bit~
   */
  start: async (queue?: TrackModel[], _id?: string): Promise<void> => {
    const state = get();

    let newQueue = queue ? [...queue] : null;

    // Check if there's already a queue planned
    if (newQueue === null && state.queue !== null) {
      newQueue = state.queue;
    }

    // FIXME: code smells
    const { hash } = window.location;
    const { library } = store.getState();

    // If no queue is provided, we create it based on the screen the user is on
    if (!newQueue) {
      if (hash.startsWith('#/playlists')) {
        newQueue = library.tracks.playlist;
      } else {
        // we are either on the library or the settings view
        // so let's play the whole library
        // Because the tracks in the store are not ordered, let's filter
        // and sort everything
        const { sort, search } = library;
        newQueue = library.tracks.library;

        newQueue = sortTracks(filterTracks(newQueue, search), SORT_ORDERS[sort.by][sort.order]);
      }
    }

    const shuffle = state.shuffle;

    const oldQueue = [...newQueue];
    const trackId = _id || newQueue[0]._id;

    // Typically, if we are in the playlists generic view without any view selected
    if (newQueue.length === 0) return;

    const queuePosition = newQueue.findIndex((track) => track._id === trackId);

    // If a track exists
    if (queuePosition > -1) {
      const track = newQueue[queuePosition];

      player.setTrack(track);
      await player.play();

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
      const queueOrigin = hash.substring(1); // remove #

      set({
        queue,
        queueCursor,
        queueOrigin,
        oldQueue,
        playerStatus: PlayerStatus.PLAY,
      });
    }
  },

  /**
   * Play/resume audio
   */
  play: async () => {
    await player.play();

    set({ playerStatus: PlayerStatus.PLAY });
  },

  /**
   * Pause audio
   */
  pause: (): void => {
    player.pause();

    set({ playerStatus: PlayerStatus.PAUSE });
  },

  /**
   * Toggle play/pause
   */
  playPause: async () => {
    const { paused } = player.getAudio();
    // TODO (y.solovyov | martpie): calling getState is a hack.
    const { queue, playerStatus } = get();

    if (playerStatus === PlayerStatus.STOP) {
      await get().start();
    } else if (paused && queue.length > 0) {
      await get().play();
    } else {
      get().pause();
    }
  },

  /**
   * Stop the player
   */
  stop: (): void => {
    player.stop();

    set({
      queue: [],
      queueCursor: null,
      playerStatus: PlayerStatus.STOP,
    });
  },

  /**
   * Jump to the next track
   */
  next: async () => {
    const { queue, queueCursor, repeat } = get();
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

      if (track !== undefined) {
        player.setTrack(track);
        await player.play();
        set({
          playerStatus: PlayerStatus.PLAY,
          queueCursor: newQueueCursor,
        });
      } else {
        get().stop();
      }
    }
  },

  /**
   * Jump to the previous track, or restart the current track after a certain
   * treshold
   */
  previous: async () => {
    const currentTime = player.getCurrentTime();

    const { queue, queueCursor } = get();
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
        player.setTrack(newTrack);
        await player.play();

        set({
          playerStatus: PlayerStatus.PLAY,
          queueCursor: newQueueCursor,
        });
      } else {
        get().stop();
      }
    }
  },

  /**
   * Enable/disable shuffle
   */
  toggleShuffle: (shuffle: boolean) => {
    config.set('audioShuffle', shuffle);
    config.save();

    const { queue, queueCursor, oldQueue } = get();

    if (queueCursor !== null) {
      const trackPlayingId = queue[queueCursor]._id;

      // If we need to shuffle everything
      if (shuffle) {
        // Let's shuffle that
        const newQueue = shuffleTracks([...queue], queueCursor);

        set({
          queue: newQueue,
          queueCursor: 0,
          oldQueue: queue,
          shuffle: true,
        });
      } else {
        // Unshuffle the queue by restoring the initial queue
        const currentTrackIndex = oldQueue.findIndex((track) => trackPlayingId === track._id);

        // Roll back to the old but update queueCursor
        set({
          queue: [...oldQueue],
          queueCursor: currentTrackIndex,
          shuffle: false,
        });
      }
    }
  },

  /**
   * Enable disable repeat
   */
  toggleRepeat: (value: Repeat) => {
    config.set('audioRepeat', value);
    config.save();

    set({
      repeat: value,
    });
  },

  /**
   * Set volume
   */
  setVolume: (volume: number) => {
    player.setVolume(volume);
    saveVolume(volume);
  },

  /**
   * Mute/unmute the audio
   */
  setMuted: (muted = false) => {
    if (muted) player.mute();
    else player.unmute();

    config.set('audioMuted', muted);
    config.save();
  },

  /**
   * Set audio's playback rate
   */
  setPlaybackRate: (value: number) => {
    if (value >= 0.5 && value <= 5) {
      // if in allowed range
      player.setPlaybackRate(value);

      config.set('audioPlaybackRate', value);
      config.save();
    }
  },

  /**
   * Set audio's output device
   */
  setOutputDevice: (deviceId = 'default') => {
    if (deviceId) {
      try {
        player
          .setOutputDevice(deviceId)
          .then(() => {
            config.set('audioOutputDevice', deviceId);
            config.save();
          })
          .catch((err: Error) => {
            throw err;
          });
      } catch (err) {
        logger.warn(err);
        useToastsStore.getState().add('danger', 'An error occured when trying to switch to the new output device');
      }
    }
  },

  /**
   * Jump to a time in the track
   */
  jumpTo: (to: number) => {
    player.setCurrentTime(to);
  },

  /**
   * Toggle play/pause
   */
  jumpToPlayingTrack: async () => {
    const queueOrigin = get().queueOrigin ?? '#/library';
    await router.navigate(queueOrigin);

    setTimeout(() => {
      LibraryActions.highlightPlayingTrack(true);
    }, 0);
  },

  /**
   * Start audio playback from the queue
   */
  startFromQueue: async (index: number) => {
    const { queue } = get();
    const track = queue[index];

    window.MuseeksAPI.player.setTrack(track);
    await window.MuseeksAPI.player.play();

    set({
      queue,
      queueCursor: index,
      playerStatus: PlayerStatus.PLAY,
    });
  },

  /**
   * Clear the queue
   */
  clearQueue: () => {
    const { queueCursor } = get();
    const queue = [...get().queue];

    if (queueCursor !== null) {
      queue.splice(queueCursor + 1, queue.length - queueCursor);

      set({
        queue,
      });
    }
  },

  /**
   * Remove track from queue
   */
  removeFromQueue: (index: number) => {
    const { queueCursor } = get();
    const queue = [...get().queue];

    if (queueCursor !== null) {
      queue.splice(queueCursor + index + 1, 1);

      set({
        queue,
      });
    }
  },

  /**
   * Add tracks at the end of the queue
   */
  addInQueue: async (tracksIds: string[]) => {
    const { queue, queueCursor } = get();
    const tracks = await window.MuseeksAPI.db.tracks.findByID(tracksIds);
    const newQueue = [...queue, ...tracks];

    set({
      queue: newQueue,
      // Set the queue cursor to zero if there is no current queue
      queueCursor: queue.length === 0 ? 0 : queueCursor,
    });
  },

  /**
   * Add tracks at the beginning of the queue
   */
  addNextInQueue: async (tracksIds: string[]) => {
    const tracks = await window.MuseeksAPI.db.tracks.findByID(tracksIds);

    const { queueCursor } = get();
    const queue = [...get().queue];

    if (queueCursor !== null) {
      queue.splice(queueCursor + 1, 0, ...tracks);
      set({
        queue,
      });
    } else {
      set({
        queue,
        queueCursor: 0,
      });
    }
  },

  /**
   * Set the queue
   */
  setQueue: (tracks: TrackModel[]) => {
    set({
      queue: tracks,
    });
  },
}));

export default usePlayerStore;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Make sure we don't save audio volume to the file system too often
 */
const saveVolume = debounce((volume: number) => {
  config.set('audioVolume', volume);
  config.save();
}, 500);

/**
 * Handle audio errors
 */
function handleAudioError(e: ErrorEvent) {
  usePlayerStore.getState().stop();

  const element = e.target as HTMLAudioElement;

  if (element) {
    const { error } = element;

    if (!error) return;

    switch (error.code) {
      case error.MEDIA_ERR_ABORTED:
        useToastsStore.getState().add('warning', AUDIO_ERRORS.aborted);
        break;
      case error.MEDIA_ERR_DECODE:
        useToastsStore.getState().add('danger', AUDIO_ERRORS.corrupt);
        break;
      case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        useToastsStore.getState().add('danger', AUDIO_ERRORS.notFound);
        break;
      default:
        useToastsStore.getState().add('danger', AUDIO_ERRORS.unknown);
        break;
    }
  }
}
