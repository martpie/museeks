import AppConstants from '../constants/AppConstants';
import utils        from '../utils/utils';

export default (state = {}, payload) => {
    switch (payload.type) {
        case(AppConstants.APP_PLAYER_PLAY): {
            return {
                ...state,
                playerStatus: 'play'
            };
        }

        case(AppConstants.APP_PLAYER_PAUSE): {
            return {
                ...state,
                playerStatus: 'pause'
            };
        }

        case(AppConstants.APP_PLAYER_STOP): {
            const newState = {
                ...state,
                queue          :  [],
                queueCursor    :  null,
                playerStatus   : 'stop'
            };

            newState.tracks = {
                library: {
                    all: null,
                    sub: null
                },
                playlist: {
                    all: null,
                    sub: null
                }
            };

            return newState;
        }

        case(AppConstants.APP_PLAYER_NEXT): {
            return {
                ...state,
                playerStatus: 'play',
                queueCursor: payload.newQueueCursor
            };
        }

        case(AppConstants.APP_PLAYER_PREVIOUS): {
            return {
                ...state,
                playerStatus: 'play',
                queueCursor: payload.newQueueCursor
            };
        }

        case(AppConstants.APP_PLAYER_JUMP_TO): {
            return state;
        }

        case(AppConstants.APP_PLAYER_SHUFFLE): {
            if(payload.shuffle) {
                // Let's shuffle that
                const queueCursor = state.queueCursor;
                let queue = [...state.queue];

                // Get the current track
                const firstTrack  = queue[queueCursor];

                // now get only what we want
                queue = queue.splice(queueCursor + 1, state.queue.length - (queueCursor + 1));

                let m = queue.length;
                let t;
                let i;
                while (m) {
                    // Pick a remaining element…
                    i = Math.floor(Math.random() * m--);

                    // And swap it with the current element.
                    t = queue[m];
                    queue[m] = queue[i];
                    queue[i] = t;
                }

                queue.unshift(firstTrack); // Add the current track at the first position

                return {
                    ...state,
                    queue,
                    shuffle: true,
                    queueCursor: 0,
                    oldQueue: state.queue,
                };
            }

            const currentTrackIndex = state.oldQueue.findIndex((track) => {
                return payload.currentSrc === `file://${encodeURI(track.path)}`;
            });

            // Roll back to the old but update queueCursor
            return {
                ...state,
                queue: [...state.oldQueue],
                queueCursor: currentTrackIndex,
                shuffle: false
            };
        }

        case(AppConstants.APP_PLAYER_REPEAT): {
            return {
                ...state,
                repeat: payload.repeat
            };
        }

        default: {
            return state;
        }
    }
};
