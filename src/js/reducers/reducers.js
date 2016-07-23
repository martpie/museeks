import fs  from 'fs';
import app from '../utils/app';

import AppConstants  from '../constants/AppConstants';

import utils from '../utils/utils';


export default (state = {}, payload) => { // payload is basically 'action'

    switch (payload.type) {

        case(AppConstants.APP_REFRESH_LIBRARY): {
            return {
                ...state,
                tracks: {
                    library: {
                        all: [...payload.tracks],
                        sub: [...payload.tracks]
                    },
                    playlist: {
                        all: [],
                        sub: []
                    }
                }
            };
        }

        case(AppConstants.APP_REFRESH_CONFIG): {
            return state;
        }

        case(AppConstants.APP_SELECT_AND_PLAY): {

            const queue = [...state.tracks[state.tracksCursor].sub];
            const id    = payload._id;

            let queueCursor = null; // Clean that variable mess later
            let queuePosition = null;

            for(let i = 0, length = queue.length; i < length; i++) {

                if(queue[i]._id === id) {
                    queuePosition = i;
                    queueCursor = i;
                    break;
                }
            }

            if(queuePosition !== null) {

                const uri = utils.parseUri(queue[queuePosition].path);
                app.audio.src = uri;
                app.audio.play();

                // Check if we have to shuffle the queue
                if(state.shuffle) {

                    let index = 0;

                    // need to check that later
                    for(let i = 0, length = queue.length; i < length; i++) {

                        if(queue[i]._id === id) {
                            index = i;
                            break;
                        }
                    }

                    const firstTrack = queue[index];

                    queue.splice(id, 1);

                    let m = queue.length, t, i;
                    while (m) {

                        // Pick a remaining element…
                        i = Math.floor(Math.random() * m--);

                        // And swap it with the current element.
                        t = queue[m];
                        queue[m] = queue[i];
                        queue[i] = t;
                    }

                    queue.unshift(firstTrack);

                    // Let's set the cursor to 0
                    queueCursor = 0;
                }

                // Backup that and change the UI
                return {
                    ...state,
                    queue,
                    queueCursor,
                    oldQueue       :  queue,
                    oldQueueCursor :  queueCursor,
                    playerStatus   : 'play'
                };
            }

            return state;
        }

        case(AppConstants.APP_FILTER_SEARCH): {

            if(!payload.search) {
                const newState = { ...state };
                newState.tracks[state.tracksCursor].sub = [...state.tracks[state.tracksCursor].all];

                return newState;
            }

            const search = utils.stripAccents(payload.search);
            const tracks = [].concat(state.tracks[state.tracksCursor].all).filter((track) => { // Problem here
                return track.loweredMetas.artist.join(', ').includes(search)
                    || track.loweredMetas.album.includes(search)
                    || track.loweredMetas.genre.join(', ').includes(search)
                    || track.loweredMetas.title.includes(search);
            });

            const newState = { ...state };
            newState.tracks[state.tracksCursor].sub = tracks;

            return newState;
        }

        case(AppConstants.APP_PLAYER_TOGGLE): {

            if(app.audio.paused && state.queue !== null) {
                app.audio.play();
                return {
                    ...state,
                    playerStatus: 'play'
                };
            }

            app.audio.pause();
            return {
                ...state,
                playerStatus: 'pause'
            };
        }

        case(AppConstants.APP_PLAYER_PLAY): {

            if(state.queue !== null) {
                app.audio.play();
                return {
                    ...state,
                    playerStatus: 'play'
                };
            }

            return state;
        }

        case(AppConstants.APP_PLAYER_PAUSE): {

            app.audio.pause();
            return {
                ...state,
                playerStatus: 'pause'
            };
        }

        case(AppConstants.APP_PLAYER_STOP): {

            app.audio.pause();
            const newState = {
                ...state,
                queue          :  [],
                queueCursor    :  null,
                oldQueueCursor :  null,
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

                app.audio.src = uri;
                app.audio.play();

                return {
                    ...state,
                    playerStatus: 'play',
                    queueCursor: newQueueCursor
                };
            }

            app.audio.pause();
            app.audio.src = '';

            // Stop
            return {
                ...state,
                queue: [],
                queueCursor    :  null,
                oldQueueCursor :  null,
                playerStatus   : 'stop'
            };
        }

        case(AppConstants.APP_PLAYER_PREVIOUS): {

            let newQueueCursor = state.queueCursor;

            // If track started less than 5 seconds ago, play th previous track, otherwise replay the current one
            if (app.audio.currentTime < 5) newQueueCursor = state.queueCursor - 1;

            const newTrack = state.queue[newQueueCursor];

            if(newTrack !== undefined) {

                const uri = utils.parseUri(newTrack.path);

                app.audio.src = uri;
                app.audio.play();

                return {
                    ...state,
                    playerStatus: 'play',
                    queueCursor: newQueueCursor
                };

            }

            // Stop
            return {
                ...state,
                queue: [],
                queueCursor    :  null,
                oldQueueCursor :  null,
                playerStatus   : 'stop'
            };
        }

        case(AppConstants.APP_PLAYER_SHUFFLE): {

            if(!state.shuffle) {

                // Let's shuffle that
                const queueCursor = state.queueCursor;
                let queue = [...state.queue];

                const firstTrack  = queue[queueCursor]; // Get the current track

                queue = queue.splice(queueCursor + 1, state.queue.length - (queueCursor + 1)); // now get only what we want

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
                    oldQueueCursor: queueCursor
                };

            }

            // Roll back
            return {
                ...state,
                queue: [...state.oldQueue],
                queueCursor: state.oldQueueCursor,
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

        case(AppConstants.APP_PLAYER_JUMP_TO): {
            app.audio.currentTime = payload.to;
            return state;
        }

        case(AppConstants.APP_QUEUE_PLAY): {

            const queue       = [].concat(state.queue);
            const queueCursor = payload.index;

            const uri = utils.parseUri(queue[queueCursor].path);
            app.audio.src = uri;
            app.audio.play();

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

        case(AppConstants.APP_LIBRARY_ADD_FOLDERS): {
            const folders    = payload.folders;
            let musicFolders = app.config.get('musicFolders');

            // Check if we reveived folders
            if(folders !== undefined) {
                // Add folders
                folders.forEach((folder) => {
                    musicFolders.push(fs.realpathSync(folder));
                });

                // Remove duplicates, useless children, ect...
                musicFolders = utils.removeUselessFolders(musicFolders);

                musicFolders.sort();

                app.config.set('musicFolders', musicFolders);
                app.config.saveSync();
            }

            return state;
        }

        case(AppConstants.APP_LIBRARY_SET_TRACKSCURSOR): {
            return {
                ...state,
                tracksCursor: payload.cursor
            };
        }

        case(AppConstants.APP_LIBRARY_REMOVE_FOLDER): {
            const musicFolders = app.config.get('musicFolders');
            musicFolders.splice(payload.index, 1);
            app.config.set('musicFolders', musicFolders);
            app.config.saveSync();
            return state;
        }

        case(AppConstants.APP_LIBRARY_RESET): {
            // nothing here for the moment
            return state;
        }

        case(AppConstants.APP_LIBRARY_REFRESH_START): {
            return {
                ...state,
                status : 'An apple a day keeps Dr Dre away',
                refreshingLibrary : true
            };
        }

        case(AppConstants.APP_LIBRARY_REFRESH_END): {
            return {
                ...state,
                refreshingLibrary : false,
                refreshProgress : 0
            };
        }

        case(AppConstants.APP_LIBRARY_REFRESH_PROGRESS): {
            return {
                ...state,
                refreshProgress : payload.percentage
            };
        }

        case(AppConstants.APP_NOTIFICATION_ADD): {
            const notifications = [...state.notifications, payload.notification];
            return {
                ...state,
                notifications
            };
        }

        case(AppConstants.APP_NOTIFICATION_REMOVE): {
            const notifications = [...state.notifications].filter((elem) => elem._id !== payload._id);
            return {
                ...state,
                notifications
            };
        }

        case(AppConstants.APP_PLAYLISTS_REFRESH): {
            return {
                ...state,
                playlists: payload.playlists
            };
        }

        case(AppConstants.APP_PLAYLISTS_LOAD_ONE): {
            const newState = { ...state };
            newState.tracks[state.tracksCursor] = {
                all: [...payload.tracks],
                sub: [...payload.tracks]
            };
            return newState;
        }

        default: {
            return state;
        }
    }
};
