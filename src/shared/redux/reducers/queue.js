import i from 'icepick';

export default (state = {}, action) => {
    switch (action.type) {

        case('QUEUE/START'): {
            const queue = [...state.queue];
            const queueCursor = action.payload.index;

            // Backup that and change the UI
            return {
                ...state,
                queue,
                queueCursor,
                playStatus: 'play'
            };
        }

        case('QUEUE/CLEAR'): {
            const queue = [...state.queue];
            queue.splice(state.queueCursor + 1, state.queue.length - state.queueCursor);
            return {
                ...state,
                queue
            };
        }

        case('QUEUE/SET'): {
            return {
                ...state,
                queue: action.payload
            };
        }

        case('QUEUE/REMOVE'): {
            const queue = [...state.queue];
            queue.splice(state.queueCursor + action.payload.index + 1, 1);
            return {
                ...state,
                queue
            };
        }

        case('QUEUE/ADD_FULFILLED'): {
            const queue = [...state.queue, ...action.payload];
            return {
                ...state,
                queue
            };
        }

        case('QUEUE/ADD_NEXT_FULFILLED'): {
            const queue = [...state.queue];
            queue.splice(state.queueCursor + 1, 0, ...action.payload);
            return {
                ...state,
                queue
            };
        }

        case('QUEUE/SET_QUEUE'): {
            return i.chain(state)
                .assoc('queue', action.payload.queue)
                .assoc('queueCursor', null)
                .assocIn(['player', 'history'], [])
                .assocIn(['player', 'historyCursor'], null)
                .value();
        }

        case('QUEUE/SET_QUEUE_CURSOR'): {
            return i.chain(state)
                .assoc('queueCursor', action.payload.queueCursor)
                .assocIn(['player', 'historyCursor'], null)
                .value();
        }

        case('PLAYER/MOVE_CURSOR_FULFILLED'): {
            const { queueCursor, historyCursor } = action.payload;
            return i.chain(state)
                .assoc('queueCursor', queueCursor)
                .assocIn(['player', 'historyCursor'], historyCursor)
                .value();
        }

        default: {
            return state;
        }
    }
};
