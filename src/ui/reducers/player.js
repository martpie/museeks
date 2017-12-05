import types from '../constants/action-types';
import { config } from '../lib/app';

const initialState = {
  queue: [], // Tracks to be played
  oldQueue: null, // Queue backup (in case of shuffle)
  queueCursor: null, // The cursor of the queue
  repeat: config.get('audioRepeat'), // the current repeat state (one, all, none)
  shuffle: config.get('audioShuffle'), // If shuffle mode is enabled
  playerStatus: 'stop', // Player status
};

export default (state = initialState, payload) => {
  switch (payload.type) {
    case(types.APP_PLAYER_START): {
      const { queue, queueCursor, oldQueue } = payload;

      // Backup that and change the UI
      return {
        ...state,
        queue,
        queueCursor,
        oldQueue,
        playerStatus : 'play',
      };
    }

    case(types.APP_PLAYER_PLAY): {
      return {
        ...state,
        playerStatus: 'play',
      };
    }

    case(types.APP_PLAYER_PAUSE): {
      return {
        ...state,
        playerStatus: 'pause',
      };
    }

    case(types.APP_PLAYER_STOP): {
      const newState = {
        ...state,
        queue          :  [],
        queueCursor    :  null,
        playerStatus   : 'stop',
      };

      return newState;
    }

    case(types.APP_PLAYER_NEXT): {
      return {
        ...state,
        playerStatus: 'play',
        queueCursor: payload.newQueueCursor,
      };
    }

    case(types.APP_PLAYER_PREVIOUS): {
      return {
        ...state,
        playerStatus: 'play',
        queueCursor: payload.newQueueCursor,
      };
    }

    case(types.APP_PLAYER_JUMP_TO): {
      return state;
    }

    case(types.APP_PLAYER_SHUFFLE): {
      if(payload.shuffle) {
        // Let's shuffle that
        const queueCursor = state.queueCursor;
        let queue = [...state.queue];

        // Get the current track
        const firstTrack  = queue[queueCursor];

        // now get only what we want
        queue = queue.splice(queueCursor + 1, state.queue.length - (queueCursor + 1));

        let m = queue.length;
        let t;
        let i;
        while (m) {
          // Pick a remaining element…
          i = Math.floor(Math.random() * m--);

          // And swap it with the current element.
          t = queue[m];
          queue[m] = queue[i];
          queue[i] = t;
        }

        queue.unshift(firstTrack); // Add the current track at the first position

        return {
          ...state,
          queue,
          shuffle: true,
          queueCursor: 0,
          oldQueue: state.queue,
        };
      }

      // Unshuffle the queue by restoring the initial queue
      const currentTrackIndex = state.oldQueue.findIndex((track) => (
        payload.currentSrc === `file://${encodeURI(track.path)}`
      ));

      // Roll back to the old but update queueCursor
      return {
        ...state,
        queue: [...state.oldQueue],
        queueCursor: currentTrackIndex,
        shuffle: false,
      };
    }

    case(types.APP_PLAYER_REPEAT): {
      return {
        ...state,
        repeat: payload.repeat,
      };
    }

    case(types.APP_QUEUE_START): {
      const queue = [...state.queue];
      const cursor = payload.index;

      // Backup that and change the UI
      return {
        ...state,
        queue,
        cursor,
        playerStatus: 'play',
      };
    }

    case(types.APP_QUEUE_CLEAR): {
      const queue = [...state.queue];
      const { queueCursor } = state;
      queue.splice(queueCursor + 1, queue.length - queueCursor);

      return {
        ...state,
        queue,
      };
    }

    case(types.APP_QUEUE_REMOVE): {
      const queue = [...state.queue];
      queue.splice(state.queueCursor + payload.index + 1, 1);
      return {
        ...state,
        queue,
      };
    }

    // Prob here
    case(types.APP_QUEUE_ADD): {
      const queue = [...state.queue, ...payload.tracks];
      return {
        ...state,
        queue,
      };
    }

    case(types.APP_QUEUE_ADD_NEXT): {
      const queue = [...state.queue];
      queue.splice(state.queueCursor + 1, 0, ...payload.tracks);
      return {
        ...state,
        queue,
      };
    }

    case(types.APP_QUEUE_SET_QUEUE): {
      return {
        ...state,
        queue: payload.tracks,
      };
    }

    default: {
      return state;
    }
  }
};
