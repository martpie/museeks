export default (state = {}, action) => {
    switch (action.type) {
        case('APP_QUEUE_START'): {
            const queue       = [...state.queue];
            const queueCursor = action.payload.index;

            // Backup that and change the UI
            return {
                ...state,
                queue,
                queueCursor,
                playerStatus: 'play'
            };
        }

        case('APP_QUEUE_CLEAR'): {
            const queue = [...state.queue];
            queue.splice(state.queueCursor + 1, state.queue.length - state.queueCursor);
            return {
                ...state,
                queue
            };
        }

        case('APP_QUEUE_REMOVE'): {
            const queue = [...state.queue];
            queue.splice(state.queueCursor + action.payload.index + 1, 1);
            return {
                ...state,
                queue
            };
        }

        // Prob here
        case('APP_QUEUE_ADD_FULFILLED'): {
            const queue = [...state.queue, ...action.payload.tracks];
            return {
                ...state,
                queue
            };
        }

        case('APP_QUEUE_ADD_NEXT_FULFILLED'): {
            const queue = [...state.queue];
            queue.splice(state.queueCursor + 1, 0, ...action.payload.tracks);
            return {
                ...state,
                queue
            };
        }

        case('APP_QUEUE_SET_QUEUE'): {
            return {
                ...state,
                queue: action.payload.queue
            };
        }

        default: {
            return state;
        }
    }
};
