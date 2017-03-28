import i from 'icepick';

export default (state = {}, action) => {
    switch (action.type) {
        case('PLAYER/SET_STATE'): {
            return i.assoc(state, 'player', action.payload.state);
        }

        case('PLAYER/LOAD_PENDING'): {
            const { currentTrack, queueCursor, historyCursor, oldHistoryCursor } = action.meta;
            const addToHistory =
                oldHistoryCursor === -1  && // we were not playing from history previously
                historyCursor === -1 // we are not playing from history currently
            return i.chain(state)
                .assoc('queueCursor', queueCursor)
                .assocIn(['player', 'currentTrack'], currentTrack)
                .assocIn(['player', 'historyCursor'], historyCursor)
                .updateIn(['player', 'history'], (history) => addToHistory ? i.push(history, currentTrack._id) : history)
                .value();
        }
        case('PLAYER/LOAD_REJECTED'): {
            const { oldCurrentTrack, oldQueueCursor, oldHistoryCursor } = action.meta;
            const addToHistory =
                oldHistoryCursor === -1  && // we were not playing from history previously
                historyCursor === -1 // we are not playing from history currently
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

        case('PLAYER/JUMP_TO'): {
            return state;
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

        case('PLAYER/SET_COVER'): {
            return i.assocIn(state, ['player', 'cover'], action.payload.cover);
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
