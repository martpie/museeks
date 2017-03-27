import i from 'icepick';

export default (state = {}, action) => {
    switch (action.type) {
        case('PLAYER/SET_STATE'): {
            return i.assoc(state, 'player', action.payload.state);
        }

        case('PLAYER/LOAD_PENDING'): {
            const { track } = action.meta;
            return i.chain(state)
                .updateIn(['player', 'history'], (history) => i.push(history, track))
                .assocIn(['player', 'currentTrack'], track)
                .value();
        }
        case('PLAYER/LOAD_REJECTED'): {
            const { oldCurrentTrack } = action.meta;
            return i.chain(state)
                .updateIn(['player', 'history'], (history) => i.slice(history, 0, -1))
                .assocIn(['player', 'currentTrack'], oldCurrentTrack)
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

        case('PLAYER/NEXT'): {
            return i.chain(state)
                .assoc('queueCursor', action.payload.queueCursor)
                .assocIn(['player', 'historyCursor'], action.payload.historyCursor)
                .value();
        }

        case('PLAYER/PREVIOUS'): {
            return i.chain(state)
                .assoc('queueCursor', action.payload.queueCursor)
                .assocIn(['player', 'historyCursor'], action.payload.historyCursor)
                .value();
        }

        case('PLAYER/PREVIOUS_PENDING'): {
            const { oldQueueCursor } = action.meta;
            const track = state.queue[state.queueCursor];

            return i.chain(state)
                .assocIn(['player', 'currentTrack'], track)
                .assoc('queueCursor', oldQueueCursor)
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
            console.log('NEW QUEUE', action.meta.newQueue)
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
