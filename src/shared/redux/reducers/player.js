import i from 'icepick';

export default (state = {}, action) => {
    switch (action.type) {
        case('PLAYER/SET_STATE'): {
            return i.assoc(state, 'player', action.payload.state);
        }

        case('PLAYER/LOAD_PENDING'): {
            const { queueCursor } = action.meta;
            const { tracks: { library: { data: tracksData } } } = state;
            const track = tracksData[state.queue[state.queueCursor]];

            return i.chain(state)
                .assoc('queueCursor', queueCursor)
                .updateIn(['player', 'history'], (history) => i.push(history, track))
                .assocIn(['player', 'currentTrack'], track)
                .value();
        }
        case('PLAYER/LOAD_REJECTED'): {
            const { oldQueueCursor, oldCurrentTrack } = action.meta;
            return i.chain(state)
                .assoc('queueCursor', oldQueueCursor)
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

        case('PLAYER/NEXT_PENDING'): {
            const { newQueueCursor, newHistoryCursor } = action.meta;
            const { tracks: { library: { data: tracksData } } } = state;
            const track = tracksData[state.queue[state.queueCursor]];

            return i.chain(state)
                .assoc('queueCursor', newQueueCursor)
                .assocIn(['player', 'historyCursor'], newHistoryCursor)
                .assocIn(['player', 'currentTrack'], track)
                .updateIn(['player', 'history'], (history) => i.push(history, track))
                .value();
        }
        case('PLAYER/NEXT_REJECTED'): {
            const { oldQueueCursor, oldHistoryCursor } = action.meta;
            return i.chain(state)
                .assoc('queueCursor', oldQueueCursor)
                .assocIn(['player', 'historyCursor'], oldHistoryCursor)
                .updateIn(['player', 'history'], (history) => i.slice(history, 0, -1))
                .value();
        }

        case('PLAYER/PREVIOUS_PENDING'): {
            const { oldQueueCursor } = action.meta;
            const { tracks: { library: { data: tracksData } } } = state;
            const track = tracksData[state.queue[state.queueCursor]];

            return i.chain(state)
                .assocIn(['player', 'currentTrack'], track)
                .assoc('queueCursor', oldQueueCursor)
                .value();
        }
        case('PLAYER/PREVIOUS_REJECTED'): { // TODO don't know what the inputs are from the action
            const { oldQueueCursor } = action.meta;
            return i.chain(state)
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
