import types from '../constants/action-types';
import { config } from '../lib/app';
import { shuffleTracks } from '../utils/utils-player';
import { TrackModel, Action, Repeat, PlayerStatus } from '../../shared/types/interfaces';

export interface PlayerState {
  queue: TrackModel[];
  oldQueue: TrackModel[];
  queueCursor: number | null;
  repeat: Repeat;
  shuffle: boolean;
  playerStatus: PlayerStatus;
}

const initialState: PlayerState = {
  queue: [], // Tracks to be played
  oldQueue: [], // Queue backup (in case of shuffle)
  queueCursor: null, // The cursor of the queue
  repeat: config.get('audioRepeat'), // the current repeat state (one, all, none)
  shuffle: config.get('audioShuffle'), // If shuffle mode is enabled
  playerStatus: PlayerStatus.STOP // Player status
};

export default (state = initialState, action: Action): PlayerState => {
  switch (action.type) {
    case (types.PLAYER_START): {
      const { queue, queueCursor, oldQueue } = action.payload;

      // Backup that and change the UI
      return {
        ...state,
        queue,
        queueCursor,
        oldQueue,
        playerStatus: PlayerStatus.PLAY
      };
    }

    case (types.PLAYER_PLAY): {
      return {
        ...state,
        playerStatus: PlayerStatus.PLAY
      };
    }

    case (types.PLAYER_PAUSE): {
      return {
        ...state,
        playerStatus: PlayerStatus.PAUSE
      };
    }

    case (types.PLAYER_STOP): {
      const newState = {
        ...state,
        queue: [],
        queueCursor: null,
        playerStatus: PlayerStatus.STOP
      };

      return newState;
    }

    case (types.PLAYER_NEXT): {
      return {
        ...state,
        playerStatus: PlayerStatus.PLAY,
        queueCursor: action.payload.newQueueCursor
      };
    }

    case (types.PLAYER_PREVIOUS): {
      return {
        ...state,
        playerStatus: PlayerStatus.PLAY,
        queueCursor: action.payload.newQueueCursor
      };
    }

    case (types.PLAYER_JUMP_TO): {
      return state;
    }

    case (types.PLAYER_SHUFFLE): {
      const { queueCursor } = state;

      if (queueCursor !== null) {
        const trackPlayingId = state.queue[queueCursor]._id;

        // If we need to shuffle everything
        if (action.payload.shuffle) {
          // Let's shuffle that

          const queue = shuffleTracks([...state.queue], queueCursor);

          return {
            ...state,
            queue,
            queueCursor: 0,
            oldQueue: state.queue,
            shuffle: true
          };
        }

        // Unshuffle the queue by restoring the initial queue
        const currentTrackIndex = state.oldQueue.findIndex(track => (
          trackPlayingId === track._id
        ));

        // Roll back to the old but update queueCursor
        return {
          ...state,
          queue: [...state.oldQueue],
          queueCursor: currentTrackIndex,
          shuffle: false
        };
      }

      return state;
    }

    case (types.PLAYER_REPEAT): {
      return {
        ...state,
        repeat: action.payload.repeat
      };
    }

    case (types.QUEUE_START): {
      const queue = [...state.queue];
      const queueCursor = action.payload.index;

      // Backup that and change the UI
      return {
        ...state,
        queue,
        queueCursor,
        playerStatus: PlayerStatus.PLAY
      };
    }

    case (types.QUEUE_CLEAR): {
      const queue = [...state.queue];
      const { queueCursor } = state;

      if (queueCursor !== null) {
        queue.splice(queueCursor + 1, queue.length - queueCursor);

        return {
          ...state,
          queue
        };
      }

      return state;
    }

    case (types.QUEUE_REMOVE): {
      const queue = [...state.queue];
      queue.splice(state.queueCursor + action.payload.index + 1, 1);
      return {
        ...state,
        queue
      };
    }

    case (types.QUEUE_ADD): {
      const queue = [...state.queue, ...action.payload.tracks];
      return {
        ...state,
        queue
      };
    }

    case (types.QUEUE_ADD_NEXT): {
      const queue = [...state.queue];
      const { queueCursor } = state;

      if (queueCursor !== null) {
        queue.splice(queueCursor + 1, 0, ...action.payload.tracks);
        return {
          ...state,
          queue
        };
      }

      return state;
    }

    case (types.QUEUE_SET_QUEUE): {
      return {
        ...state,
        queue: action.payload.tracks
      };
    }

    default: {
      return state;
    }
  }
};
