import types from '../constants/action-types';
import { config } from '../lib/app';
import Player from '../lib/player';
import * as utils from '../utils/utils';
import { shuffleTracks } from '../utils/utils-player';
import { TrackModel, Action, Repeat, PlayerStatus, LinvoSchema, Track } from '../../shared/types/interfaces';

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

/**
 * What state from `PlayerState` to we need to calculate the queue of tracks
 * to send to Player
 */
type RequiredQueueingState = Pick<PlayerState, 'queue' | 'queueCursor' | 'repeat'>;

/**
 * Update the player with the src URIs that should be queued for the current
 * and upcoming songs.
 */
export const updatePlayerTrackQueue = <T extends RequiredQueueingState>(state: T) => {
  const { queue, queueCursor, repeat } = state;
  if (queueCursor === null || queueCursor > queue.length - 1) {
    Player.setTracks([]);
    return state;
  }

  let tracks: LinvoSchema<Track>[];
  if (repeat === Repeat.ONE) {
    // If we are repeating the same track,
    // it should be sent twice for gapless playback
    tracks = [queue[queueCursor], queue[queueCursor]];
  } else if (repeat === Repeat.ALL) {
    // Send the remainder of the queue,
    // plus the queue in it's entirety again
    tracks = [...queue.slice(queueCursor), ...queue];
  } else {
    // Normal playback
    tracks = queue.slice(queueCursor);
  }
  Player.setTracks(tracks.map((track) => utils.parseUri(track.path)));
  return state;
};

export default (state = initialState, action: Action): PlayerState => {
  switch (action.type) {
    case types.PLAYER_START: {
      const { queue, queueCursor, oldQueue } = action.payload;

      // Backup that and change the UI
      return updatePlayerTrackQueue({
        ...state,
        queue,
        queueCursor,
        oldQueue,
        playerStatus: PlayerStatus.PLAY
      });
    }

    case types.PLAYER_PLAY: {
      return updatePlayerTrackQueue({
        ...state,
        playerStatus: PlayerStatus.PLAY
      });
    }

    case types.PLAYER_PAUSE: {
      return updatePlayerTrackQueue({
        ...state,
        playerStatus: PlayerStatus.PAUSE
      });
    }

    case types.PLAYER_STOP: {
      const newState = {
        ...state,
        queue: [],
        queueCursor: null,
        playerStatus: PlayerStatus.STOP
      };

      return updatePlayerTrackQueue(newState);
    }

    case types.PLAYER_NEXT: {
      return updatePlayerTrackQueue({
        ...state,
        playerStatus: PlayerStatus.PLAY,
        queueCursor: action.payload.newQueueCursor
      });
    }

    case types.PLAYER_PREVIOUS: {
      return updatePlayerTrackQueue({
        ...state,
        playerStatus: PlayerStatus.PLAY,
        queueCursor: action.payload.newQueueCursor
      });
    }

    case types.PLAYER_JUMP_TO: {
      return state;
    }

    case types.PLAYER_SHUFFLE: {
      const { queueCursor } = state;

      if (queueCursor !== null) {
        const trackPlayingId = state.queue[queueCursor]._id;

        // If we need to shuffle everything
        if (action.payload.shuffle) {
          // Let's shuffle that

          const queue = shuffleTracks([...state.queue], queueCursor);

          return updatePlayerTrackQueue({
            ...state,
            queue,
            queueCursor: 0,
            oldQueue: state.queue,
            shuffle: true
          });
        }

        // Unshuffle the queue by restoring the initial queue
        const currentTrackIndex = state.oldQueue.findIndex((track) => trackPlayingId === track._id);

        // Roll back to the old but update queueCursor
        return updatePlayerTrackQueue({
          ...state,
          queue: [...state.oldQueue],
          queueCursor: currentTrackIndex,
          shuffle: false
        });
      }

      return state;
    }

    case types.PLAYER_REPEAT: {
      return updatePlayerTrackQueue({
        ...state,
        repeat: action.payload.repeat
      });
    }

    case types.QUEUE_START: {
      const queue = [...state.queue];
      const queueCursor = action.payload.index;

      // Backup that and change the UI
      return updatePlayerTrackQueue({
        ...state,
        queue,
        queueCursor,
        playerStatus: PlayerStatus.PLAY
      });
    }

    case types.QUEUE_CLEAR: {
      const queue = [...state.queue];
      const { queueCursor } = state;

      if (queueCursor !== null) {
        queue.splice(queueCursor + 1, queue.length - queueCursor);

        return updatePlayerTrackQueue({
          ...state,
          queue
        });
      }

      return state;
    }

    case types.QUEUE_REMOVE: {
      const queue = [...state.queue];
      queue.splice(state.queueCursor + action.payload.index + 1, 1);
      return updatePlayerTrackQueue({
        ...state,
        queue
      });
    }

    case types.QUEUE_ADD: {
      const queue = [...state.queue, ...action.payload.tracks];
      return updatePlayerTrackQueue({
        ...state,
        queue
      });
    }

    case types.QUEUE_ADD_NEXT: {
      const queue = [...state.queue];
      const { queueCursor } = state;

      if (queueCursor !== null) {
        queue.splice(queueCursor + 1, 0, ...action.payload.tracks);
        return updatePlayerTrackQueue({
          ...state,
          queue
        });
      }

      return state;
    }

    case types.QUEUE_SET_QUEUE: {
      return updatePlayerTrackQueue({
        ...state,
        queue: action.payload.tracks
      });
    }

    default: {
      return state;
    }
  }
};
