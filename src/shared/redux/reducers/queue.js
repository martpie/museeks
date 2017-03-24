export default (state = {}, action) => {
    switch (action.type) {
        case('QUEUE/START'): {
            const queue       = [...state.queue];
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
            const queue = [...state.queue, ...action.payload.tracks];
            return {
                ...state,
                queue
            };
        }

        case('QUEUE/ADD_NEXT_FULFILLED'): {
            const queue = [...state.queue];
            queue.splice(state.queueCursor + 1, 0, ...action.payload.tracks);
            return {
                ...state,
                queue
            };
        }

        case('QUEUE/SET_QUEUE'): {
            return {
                ...state,
                queue: action.payload.queue
            };
        }

        case('QUEUE/SET_CURSOR'): {
            return {
                ...state,
                queueCursor: action.payload.index
            };
        }

        default: {
            return state;
        }
    }
};
