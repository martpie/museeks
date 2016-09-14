import AppConstants from '../constants/AppConstants';
import Player       from '../lib/player';
import utils        from '../utils/utils';

export default (state = {}, payload) => {
    switch (payload.type) {
        case(AppConstants.APP_QUEUE_PLAY): {

            const queue       = [].concat(state.queue);
            const queueCursor = payload.index;

            const uri = utils.parseUri(queue[queueCursor].path);
            Player.setAudioSrc(uri);
            Player.play();

            // Backup that and change the UI
            return {
                ...state,
                queue,
                queueCursor,
                playerStatus: 'play'
            };
        }

        case(AppConstants.APP_QUEUE_CLEAR): {
            const queue = [...state.queue];
            queue.splice(state.queueCursor + 1, state.queue.length - state.queueCursor);
            return {
                ...state,
                queue
            };
        }

        case(AppConstants.APP_QUEUE_REMOVE): {
            const queue = [...state.queue];
            queue.splice(state.queueCursor + payload.index + 1, 1);
            return {
                ...state,
                queue
            };
        }

        // Prob here
        case(AppConstants.APP_QUEUE_ADD): {
            const queue = [...state.queue, ...payload.tracks];
            return {
                ...state,
                queue
            };
        }

        case(AppConstants.APP_QUEUE_ADD_NEXT): {
            const queue = [...state.queue];
            queue.splice(state.queueCursor + 1, 0, ...payload.tracks);
            return {
                ...state,
                queue
            };
        }

        case(AppConstants.APP_QUEUE_SET_QUEUE): {
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
