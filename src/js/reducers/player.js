import AppConstants from '../constants/AppConstants';
import Player       from '../lib/player';
import utils        from '../utils/utils';

export default (state = {}, payload) => {
    switch (payload.type) {
        case(AppConstants.APP_PLAYER_TOGGLE): {

            if(Player.getAudio().paused && state.queue !== null) {
                Player.play();
                return {
                    ...state,
                    playerStatus: 'play'
                };
            }

            Player.pause();
            return {
                ...state,
                playerStatus: 'pause'
            };
        }

        case(AppConstants.APP_PLAYER_PLAY): {

            if(state.queue !== null) {
                Player.play();
                return {
                    ...state,
                    playerStatus: 'play'
                };
            }

            return state;
        }

        case(AppConstants.APP_PLAYER_PAUSE): {

            Player.pause();
            return {
                ...state,
                playerStatus: 'pause'
            };
        }

        case(AppConstants.APP_PLAYER_STOP): {

            Player.pause();
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

            const queue = [...state.queue];
            let newQueueCursor;

            if(state.repeat === 'one') {
                newQueueCursor = state.queueCursor;
            } else if (
                state.repeat === 'all' &&
                state.queueCursor === queue.length - 1 // is last track
            ) {
                newQueueCursor = 0; // start with new track
            } else {
                newQueueCursor = state.queueCursor + 1;
            }

            if (queue[newQueueCursor] !== undefined) {

                const uri = utils.parseUri(queue[newQueueCursor].path);

                Player.setAudioSrc(uri);
                Player.play();

                return {
                    ...state,
                    playerStatus: 'play',
                    queueCursor: newQueueCursor
                };
            }

            Player.pause();

            // Stop
            return {
                ...state,
                queue: [],
                queueCursor    :  null,
                playerStatus   : 'stop'
            };
        }

        case(AppConstants.APP_PLAYER_PREVIOUS): {

            let newQueueCursor = state.queueCursor;

            // If track started less than 5 seconds ago, play th previous track,
            // otherwise replay the current one
            if (Player.getAudio().currentTime < 5) {
                newQueueCursor = state.queueCursor - 1;
            }

            const newTrack = state.queue[newQueueCursor];

            if(newTrack !== undefined) {

                const uri = utils.parseUri(newTrack.path);

                Player.setAudioSrc(uri);
                Player.play();

                return {
                    ...state,
                    playerStatus: 'play',
                    queueCursor: newQueueCursor
                };

            }

            // Stop
            Player.pause();

            return {
                ...state,
                queue: [],
                queueCursor    :  null,
                playerStatus   : 'stop'
            };
        }

        case(AppConstants.APP_PLAYER_JUMP_TO): {
            Player.setAudioCurrentTime(payload.to);
            return state;
        }

        case(AppConstants.APP_PLAYER_SHUFFLE): {

            if(!state.shuffle) {

                // Let's shuffle that
                const queueCursor = state.queueCursor;
                let queue = [...state.queue];

                // Get the current track
                const firstTrack  = queue[queueCursor];

                // now get only what we want
                queue = queue.splice(queueCursor + 1, state.queue.length - (queueCursor + 1));

                let m = queue.length, t, i;
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

            const currentTrackSrc = Player.getAudio().src;
            const currentTrackIndex = state.oldQueue.findIndex((track) => {
                return currentTrackSrc === `file://${encodeURI(track.path)}`;
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

            const repeatState = state.repeat;
            let newRepeatState;

            if(repeatState === 'all') {
                newRepeatState = 'one';
            } else if (repeatState === 'one') {
                newRepeatState = false;
            } else if (repeatState === false) {
                newRepeatState = 'all';
            }

            return {
                ...state,
                repeat: newRepeatState
            };
        }

        default: {
            return state;
        }
    }
};
