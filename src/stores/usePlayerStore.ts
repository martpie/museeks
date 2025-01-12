import debounce from 'lodash-es/debounce';
import type { StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Repeat, Track } from '../generated/typings';
import config from '../lib/config';
import database from '../lib/database';
import player from '../lib/player';
import { logAndNotifyError } from '../lib/utils';
import { shuffleTracks } from '../lib/utils-player';
import { type API, PlayerStatus } from '../types/syncudio';

import { createStore } from './store-helpers';

type PlayerState = API<{
  queue: Track[];
  oldQueue: Track[];
  queueCursor: number | null;
  queueOrigin: null | string;
  repeat: Repeat;
  shuffle: boolean;
  playerStatus: PlayerStatus;
  api: {
    start: (queue: Track[], id?: string) => Promise<void>;
    play: () => Promise<void>;
    pause: () => void;
    playPause: () => Promise<void>;
    stop: () => void;
    previous: () => Promise<void>;
    next: () => Promise<void>;
    toggleShuffle: (value?: boolean) => void;
    toggleRepeat: (value?: Repeat) => void;
    setVolume: (volume: number) => void;
    setMuted: (muted: boolean) => void;
    setPlaybackRate: (value: number) => Promise<void>;
    setOutputDevice: (deviceID: string) => Promise<void>;
    jumpTo: (to: number) => void;
    startFromQueue: (index: number) => Promise<void>;
    clearQueue: () => void;
    removeFromQueue: (index: number) => void;
    addInQueue: (tracksIDs: string[]) => Promise<void>;
    addNextInQueue: (tracksIDs: string[]) => Promise<void>;
    setQueue: (tracks: Track[]) => void;
  };
}>;

const usePlayerStore = createPlayerStore<PlayerState>((set, get) => ({
  queue: [], // Tracks to be played
  oldQueue: [], // Queue backup (in case of shuffle)
  queueCursor: null, // The cursor of the queue
  queueOrigin: null, // URL of the queue when it was started
  repeat: config.getInitial('audio_repeat'), // the current repeat state (one, all, none)
  shuffle: config.getInitial('audio_shuffle'), // If shuffle mode is enabled
  playerStatus: PlayerStatus.STOP, // Player status

  api: {
    /**
     * Start playing audio (queue instantiation, shuffle and everything...)
     * TODO: this function ~could probably~ needs to be refactored ~a bit~
     */
    start: async (tracks, _id) => {
      // TODO: implement start with no queue
      //   // If no queue is provided, we create it based on the screen the user is on
      // if (!queue) {
      //   if (location.hash.startsWith('#/playlists')) {
      //     queue = library.tracks.playlist;
      //     queue = [];
      //   } else {
      //     // we are either on the library or the settings view
      //     // so let's play the whole library
      //     // Because the tracks in the store are not ordered, let's filter
      //     // and sort everything
      //     const { sort, search } = library;
      //     queue = library.tracks;

      //     queue = sortTracks(
      //       filterTracks(newQueue, search),
      //       SORT_ORDERS[sort.by][sort.order],
      //     );
      //   }
      // }

      let queue = tracks;

      if (queue.length === 0) return;

      const state = get();

      // Check if there's already a queue planned
      if (queue === null && state.queue !== null) {
        queue = state.queue;
      }

      const shuffle = state.shuffle;

      const oldQueue = [...queue];
      const trackID = _id || queue[0].id;

      // Typically, if we are in the playlists generic view without any view selected
      if (queue.length === 0) return;

      const queuePosition = queue.findIndex((track) => track.id === trackID);

      // If a track exists
      if (queuePosition > -1) {
        const track = queue[queuePosition];

        await player.setTrack(track);
        await player.play().catch(logAndNotifyError);

        let queueCursor = queuePosition; // Clean that variable mess later

        // Check if we have to shuffle the queue
        if (shuffle) {
          // Shuffle the tracks
          queue = shuffleTracks(queue, queueCursor);
          // Let's set the cursor to 0
          queueCursor = 0;
        }

        // Determine the queue origin in case the user wants to jump to the current
        // track
        const { hash } = window.location;
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
      // TODO: if there is no queue / no audio set, get the data of the current view
      // and start a queue with it
      await player.play();

      set({ playerStatus: PlayerStatus.PLAY });
    },

    /**
     * Pause audio
     */
    pause: () => {
      player.pause();

      set({ playerStatus: PlayerStatus.PAUSE });
    },

    /**
     * Toggle play/pause
     * FIXME: how to start when player is stopped?
     */
    playPause: async () => {
      const playerAPI = get().api;
      const { queue /* , playerStatus */ } = get();
      const { paused } = player.getAudio();

      // if (playerStatus === PlayerStatus.STOP) {
      //   playerAPI.start(tracks);
      // } else
      if (paused && queue.length > 0) {
        playerAPI.play();
      } else {
        playerAPI.pause();
      }
    },

    /**
     * Stop the player
     */
    stop: () => {
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
        if (repeat === 'One') {
          newQueueCursor = queueCursor;
        } else if (repeat === 'All' && queueCursor === queue.length - 1) {
          // is last track
          newQueueCursor = 0; // start with new track
        } else {
          newQueueCursor = queueCursor + 1;
        }

        const track = queue[newQueueCursor];

        if (track !== undefined) {
          await player.setTrack(track);
          await player.play();
          set({
            playerStatus: PlayerStatus.PLAY,
            queueCursor: newQueueCursor,
          });
        } else {
          get().api.stop();
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

        if (newTrack !== undefined) {
          await player.setTrack(newTrack);
          await player.play();

          set({
            playerStatus: PlayerStatus.PLAY,
            queueCursor: newQueueCursor,
          });
        } else {
          get().api.stop();
        }
      }
    },

    /**
     * Enable/disable shuffle
     */
    toggleShuffle: async (shuffle) => {
      const nextShuffleState: boolean = shuffle ?? !get().shuffle;
      await config.set('audio_shuffle', nextShuffleState);

      const { queue, queueCursor, oldQueue } = get();

      if (queueCursor !== null) {
        const trackPlayingID = queue[queueCursor].id;

        // If we need to shuffle everything
        if (nextShuffleState) {
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
          const currentTrackIndex = oldQueue.findIndex(
            (track) => trackPlayingID === track.id,
          );

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
    toggleRepeat: async (repeat) => {
      let nextRepeatState: Repeat = 'None';

      // Get to the next repeat type if none is specified
      if (repeat === undefined) {
        switch (get().repeat) {
          case 'None':
            nextRepeatState = 'All';
            break;
          case 'All':
            nextRepeatState = 'One';
            break;
          case 'One':
            nextRepeatState = 'None';
            break;
        }
      }

      await config.set('audio_repeat', nextRepeatState);
      set({ repeat: nextRepeatState });
    },

    /**
     * Set volume
     */
    setVolume: (volume) => {
      player.setVolume(volume);
      saveVolume(volume);
    },

    /**
     * Mute/unmute the audio
     */
    setMuted: async (muted = false) => {
      if (muted) player.mute();
      else player.unmute();

      await config.set('audio_muted', muted);
    },

    /**
     * Set audio's playback rate
     */
    setPlaybackRate: async (value) => {
      // if in allowed range
      if (!Number.isNaN(value) && value >= 0.5 && value <= 5) {
        await config.set('audio_playback_rate', value);
        player.setPlaybackRate(value);
      } else {
        await config.set('audio_playback_rate', null);
        player.setPlaybackRate(1.0);
      }
    },

    /**
     * Set audio's output device
     */
    setOutputDevice: async (deviceID = 'default') => {
      if (deviceID) {
        try {
          await player.setOutputDevice(deviceID);
          await config.set('audio_output_device', deviceID);
        } catch (err) {
          logAndNotifyError(err);
        }
      }
    },

    /**
     * Jump to a time in the track
     */
    jumpTo: (to) => {
      player.setCurrentTime(to);
    },

    /**
     * Start audio playback from the queue
     */
    startFromQueue: async (index) => {
      const { queue } = get();
      const track = queue[index];

      await player.setTrack(track);
      await player.play();

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
    removeFromQueue: (index) => {
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
    addInQueue: async (tracksIDs) => {
      const { queue, queueCursor } = get();
      const tracks = await database.getTracks(tracksIDs);
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
    addNextInQueue: async (tracksIDs) => {
      const tracks = await database.getTracks(tracksIDs);

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
    setQueue: (tracks) => {
      set({
        queue: tracks,
      });
    },
  },
}));

export default usePlayerStore;

export function usePlayerAPI() {
  return usePlayerStore((state) => state.api);
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Special store for player
 */
function createPlayerStore<T extends PlayerState>(store: StateCreator<T>) {
  return createStore(
    persist(store, {
      name: 'syncudio-player',
      partialize: (state) => {
        // on macOS, localStorage is quite limited, so we limit the max number of items
        // in the queue by slicing the queue around the currently playing track
        // Should oldQueue be tackled in some ways?
        const queue = state.queue;
        const queueCursor = state.queueCursor ?? 0;
        const queueStorageLimit = 1000;

        if (queue.length < queueStorageLimit) {
          return state;
        }

        const trackID = queue[queueCursor].id;

        const persistedQueue = queue.slice(
          Math.max(0, queueCursor - queueStorageLimit / 2),
          Math.min(queue.length, queueCursor + queueStorageLimit / 2),
        );

        const persistedCursor = persistedQueue.findIndex(
          (track) => track.id === trackID,
        );

        return {
          ...state,
          queue: persistedQueue,
          queueCursor: persistedCursor,
        };
      },
      onRehydrateStorage: () => {
        return async (state, error) => {
          if (error || state == null) {
            logAndNotifyError(
              error,
              'an error happened during player store hydration',
            );
          } else {
            //  Let's set the player's src and currentTime with the info we have persisted in store
            const { queue, queueCursor } = state;
            if (queue && queueCursor) {
              const track = queue[queueCursor];
              await player.setTrack(track);
            }
          }
        };
      },
      merge(persistedState, currentState) {
        const stateToPersist = (persistedState ?? {
          playerStatus: PlayerStatus.STOP,
        }) satisfies Partial<PlayerState>;

        const mergedState = {
          ...currentState,
          ...stateToPersist,
          // API should never be persisted
          api: currentState.api,
        };

        if (persistedState != null) {
          // If player status was playing, set it to pause, as it makes no sense
          // to auto-start playing a song when Syncudio starts
          mergedState.playerStatus =
            (persistedState as PlayerState).playerStatus === PlayerStatus.PLAY
              ? PlayerStatus.PAUSE
              : (persistedState as PlayerState).playerStatus;
        }

        return mergedState;
      },
    }),
  );
}

/**
 * Make sure we don't save audio volume to the file system too often
 */
const saveVolume = debounce(async (volume: number) => {
  await config.set('audio_volume', volume);
}, 500);
