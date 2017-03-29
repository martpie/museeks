import i from 'icepick';

export default (state = {}, action) => {
    switch (action.type) {
        case('PLAYER/LOAD_PENDING'): {
            const { currentTrack, queueCursor, historyCursor, oldHistoryCursor, oldCurrentTrack } = action.meta;
            const { repeat } = state.player;

            const addToHistory =
                oldCurrentTrack &&                          // we have played a track previously
                historyCursor === -1 &&                     // we are not playing from history currently
                oldHistoryCursor === -1 &&                  // we were not playing from history previously
                repeat !== 'one' &&                         // we are not looping over the same track
                oldCurrentTrack._id !== currentTrack._id;   // do not add the same track to history twice in a row
// console.log('=======================')
// console.log(action)
// console.log('=======================')
// console.log(state)
// console.log('=======================')
            return i.chain(state)
                .assoc('queueCursor', queueCursor)
                .assocIn(['player', 'currentTrack'], currentTrack)
                .assocIn(['player', 'historyCursor'], historyCursor)
                .updateIn(['player', 'history'], (history) => addToHistory ? i.push(history, currentTrack._id) : history)
                .value();
        }
        case('PLAYER/LOAD_REJECTED'): {
            const { historyCursor, oldCurrentTrack, oldQueueCursor, oldHistoryCursor } = action.meta;
            const addToHistory =
                oldHistoryCursor === -1 && // we were not playing from history previously
                historyCursor === -1; // we are not playing from history currently
            return i.chain(state)
                .assoc('queueCursor', oldQueueCursor)
                .updateIn(['player', 'history'], (history) => addToHistory ? i.slice(history, 0, -1) : history)
                .assocIn(['player', 'currentTrack'], oldCurrentTrack)
                .assocIn(['player', 'historyCursor'], oldHistoryCursor)
                .value();
        }
        case('PLAYER/PLAY_PENDING'): {
            return i.assocIn(state, ['player', 'playStatus'], 'play');
        }
        case('PLAYER/PLAY_REJECTED'): {
            return i.assocIn(state, ['player', 'playStatus'], 'pause');
        }
        case('PLAYER/PAUSE_PENDING'): {
            return i.assocIn(state, ['player', 'playStatus'], 'pause');
        }
        case('PLAYER/PAUSE_REJECTED'): {
            return i.assocIn(state, ['player', 'playStatus'], 'play');
        }
        case('PLAYER/STOP_PENDING'): {
            return i.chain(state)
                .assoc('queue', [])
                .assoc('queueCursor', null)
                .assocIn(['player', 'playStatus'], 'stop')
                .value();
        }

        case('PLAYER/JUMP_TO_PENDING'): {
            return i.assocIn(state, ['player', 'elapsed'], action.meta.time);
        }
        case('PLAYER/JUMP_TO_REJECTED'): {
            return i.assocIn(state, ['player', 'elapsed'], action.meta.prevTime);
        }
        case('PLAYER/UPDATE_ELAPSED_TIME'): {
            return i.assocIn(state, ['player', 'elapsed'], action.payload);
        }
        case('PLAYER/SHUFFLE_PENDING'): {
            return i.assocIn(state, ['player', 'shuffle'], action.meta.shuffle);
        }
        case('PLAYER/SHUFFLE_REJECTED'): {
            return i.assocIn(state, ['player', 'shuffle'], action.meta.prevShuffle);
        }
        case('PLAYER/REPEAT_PENDING'): {
            return i.assocIn(state, ['player', 'repeat'], action.meta.repeat);
        }
        case('PLAYER/REPEAT_REJECTED'): {
            return i.assocIn(state, ['player', 'repeat'], action.meta.prevRepeat);
        }
        case('PLAYER/SET_VOLUME_FULFILLED'): {
            return i.assocIn(state, ['player', 'volume'], action.meta.volume);
        }
        case('PLAYER/SET_VOLUME_REJECTED'): {
            return i.assocIn(state, ['player', 'volume'], action.meta.oldVolume);
        }
        case('PLAYER/CREATE_NEW_QUEUE_PENDING'): {
            return i.chain(state)
                .assoc('queue', action.meta.newQueue)
                .assoc('queueCursor', null)
                .value();
        }
        case('PLAYER/CREATE_NEW_QUEUE_REJECTED'): {
            return i.chain(state)
                .assoc('queue', action.meta.oldQueue)
                .assoc('queueCursor', action.meta.oldQueueCursor)
                .value();
        }
        default: {
            return state;
        }
    }
};
