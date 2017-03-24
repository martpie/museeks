import i from 'icepick';

export default (state = {}, action) => {
    switch (action.type) {
        case('PLAYER/LOAD'): {
            const { queue, queueCursor } = action.payload;
            const track = queue[queueCursor];
            return i.chain(state)
                .assoc('queue', queue)
                .assoc('queueCursor', queueCursor)
                .updateIn(['player', 'history'], (history) => i.push(history, track))
                .assocIn(['player', 'currentTrack'], track)
                .value();
        }

        case('PLAYER/CREATE_NEW_QUEUE_PENDING'): {
            return i.assoc(state, 'queue', action.meta.newQueue);
        }
        case('PLAYER/CREATE_NEW_QUEUE_REJECTED'): {
            return i.assoc(state, 'queue', action.meta.oldQueue);
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
            const { newQueueCursor } = action.payload;
            const previousTrack = state.queue[state.queueCursor];
            const currentTrack = state.queue[newQueueCursor];
            return i.chain(state)
                .assoc('queueCursor', newQueueCursor)
                .updateIn(['player', 'history'], (history) => i.push(history, previousTrack))
                .value();
        }
        case('PLAYER/PREVIOUS'): {
            const { newQueueCursor } = action.payload;
            const currentTrack = state.queue[newQueueCursor];
            return i.chain(state)
                .assoc('queueCursor', newQueueCursor)
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

        case('PLAYER/FETCHED_COVER'): {
            return i.assocIn(state, ['player', 'cover'], action.payload.cover);
        }

        default: {
            return state;
        }
    }
};
