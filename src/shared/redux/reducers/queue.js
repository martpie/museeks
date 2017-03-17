module.exports = (state = {}, payload) => {
    switch (payload.type) {
        case('APP_QUEUE_START'): {
            const queue       = [...state.queue];
            const queueCursor = payload.index;

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
            queue.splice(state.queueCursor + payload.index + 1, 1);
            return {
                ...state,
                queue
            };
        }

        // Prob here
        case('APP_QUEUE_ADD_FULFILLED'): {
            const queue = [...state.queue, ...payload.tracks];
            return {
                ...state,
                queue
            };
        }

        case('APP_QUEUE_ADD_NEXT_FULFILLED'): {
            const queue = [...state.queue];
            queue.splice(state.queueCursor + 1, 0, ...payload.tracks);
            return {
                ...state,
                queue
            };
        }

        case('APP_QUEUE_SET_QUEUE'): {
            return {
                ...state,
                queue: payload.queue
            };
        }

        default: {
            return state;
        }
    }
};
