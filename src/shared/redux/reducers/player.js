import i from 'icepick';

export default (state = {}, action) => {
    switch (action.type) {
        case('PLAYER/START'): {
            const { queue, queueCursor } = action.payload;
            const track = queue[queueCursor];
            return i.chain(state)
                .assoc('queue', queue)
                .assoc('queueCursor', queueCursor)
                .updateIn(['player', 'history'], (history) => i.push(history, track))
                .assocIn(['player', 'currentTrack'], track)
                .value();
        }

        case('PLAYER/PLAY'): {
            return i.assocIn(state, ['player', 'playStatus'], 'play');
        }

        case('PLAYER/PAUSE'): {
            return i.assocIn(state, ['player', 'playStatus'], 'pause');
        }

        case('PLAYER/STOP'): {
            return i.chain(state)
                .assoc('queue', [])
                .assoc('queueCursor', null)
                .assocIn(['player', 'playStatus'], 'stop')
                .value();
        }

        case('PLAYER/NEXT'):
        case('PLAYER/PREVIOUS'): {
            const { oldQueueCursor, newQueueCursor } = action.payload;
            const queue = state.queue;
            const previousTrack = queue[oldQueueCursor];
            const currentTrack = queue[newQueueCursor];
            return i.chain(state)
                .assoc('queueCursor', newQueueCursor)
                .updateIn(['player', 'history'], (history) => i.push(history, previousTrack))
                .assocIn(['player', 'currentTrack'], currentTrack)
                .value();
        }

        case('PLAYER/JUMP_TO'): {
            return state;
        }

        case('PLAYER/SHUFFLE'): {
            if (action.payload.shuffle) {
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

            const currentTrackIndex = state.player.oldQueue.findIndex((track) => {
                return action.payload.currentSrc === `file://${encodeURI(track.path)}`;
            });

            // Roll back to the old but update queueCursor
            return {
                ...state,
                queue: [...state.player.oldQueue],
                queueCursor: currentTrackIndex,
                shuffle: false
            };
        }

        case('PLAYER/REPEAT'): {
            return i.assocIn(state, ['player', 'repeat'], action.payload.repeat);
        }

        case('PLAYER/FETCHED_COVER'): {
            return i.assocIn(state, ['player', 'cover'], action.payload.cover || null);
        }

        default: {
            return state;
        }
    }
};
