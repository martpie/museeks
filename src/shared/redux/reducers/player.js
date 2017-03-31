import i from 'icepick';

export default (state = {}, action) => {
    switch (action.type) {
        case('PLAYER/LOAD_PENDING'): {
            const { queue, queueCursor, currentTrack, historyCursor, oldHistoryCursor } = action.meta;
            const { repeat, history } = state.player;

            const addToHistory =
                historyCursor === -1 &&                             // we are not playing from history currently
                repeat !== 'one' &&                                 // we are not looping over the same track
                history[history.length - 1] !== currentTrack._id;   // do not add the same track to history twice in a row

            const shouldDropFutureHistory =
                oldHistoryCursor !== -1 &&                  // we were playing from history previously
                historyCursor === -1 &&                     // we aren't playing from history any more
                oldHistoryCursor !== history.length;        // we were in the history array, not at the end

            const newHistory = shouldDropFutureHistory
                ? history.slice(0, oldHistoryCursor + 1)
                : history;
// console.log('=======================')
// console.log(action)
// console.log('=======================')
// console.log(addToHistory)
// console.log(newHistory)
// console.log(state)
// console.log('=======================')

            return i.chain(state)
                .assoc('queueCursor', queueCursor)
                .updateIn(['queue'], (existingQueue) => existingQueue || queue)
                .assocIn(['player', 'currentTrack'], currentTrack)
                .assocIn(['player', 'historyCursor'], historyCursor)
                .assocIn(['player', 'history'], addToHistory ? i.push(newHistory, currentTrack._id) : newHistory)
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
                .assocIn(['player', 'currentTrack'], {})
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

        case('PLAYER/SET_CURSORS'): {
            return i.chain(state)
                .assocIn(['queueCursor'], action.payload.queueCursor)
                .assocIn(['player', 'historyCursor'], action.payload.historyCursor)
                .value();
        }

        default: {
            return state;
        }
    }
};
