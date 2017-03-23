export default (state = {}, action) => {
    switch (action.type) {
        case('QUEUE/START'): {
            const queue       = [...state.player.queue];
            const queueCursor = action.payload.index;

            // Backup that and change the UI
            return {
                ...state,
                queue,
                queueCursor,
                playerStatus: 'play'
            };
        }

        case('QUEUE/CLEAR'): {
            const queue = [...state.player.queue];
            queue.splice(state.player.queueCursor + 1, state.player.queue.length - state.player.queueCursor);
            return {
                ...state,
                queue
            };
        }

        case('QUEUE/REMOVE'): {
            const queue = [...state.player.queue];
            queue.splice(state.player.queueCursor + action.payload.index + 1, 1);
            return {
                ...state,
                queue
            };
        }

        // Prob here
        case('QUEUE/ADD_FULFILLED'): {
            const queue = [...state.player.queue, ...action.payload.tracks];
            return {
                ...state,
                queue
            };
        }

        case('QUEUE/ADD_NEXT_FULFILLED'): {
            const queue = [...state.player.queue];
            queue.splice(state.player.queueCursor + 1, 0, ...action.payload.tracks);
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

        default: {
            return state;
        }
    }
};
