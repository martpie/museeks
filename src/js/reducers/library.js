import app          from '../lib/app';
import Player       from '../lib/player';
import AppConstants from '../constants/AppConstants';
import utils        from '../utils/utils';

export default (state = {}, payload) => {
    switch (payload.type) {
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

                Player.setAudioSrc(uri);
                Player.play();

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

            const allCurrentTracks = state.tracks[state.tracksCursor].all;
            const tracks = [].concat(allCurrentTracks).filter((track) => { // Problem here
                return track.loweredMetas.artist.join(', ').includes(search)
                    || track.loweredMetas.album.includes(search)
                    || track.loweredMetas.genre.join(', ').includes(search)
                    || track.loweredMetas.title.includes(search);
            });

            const newState = { ...state };
            newState.tracks[state.tracksCursor].sub = tracks;

            return newState;
        }

        case(AppConstants.APP_LIBRARY_FETCHED_COVER): {
            return {
                ...state,
                cover: payload.cover || null
            };
        }

        case(AppConstants.APP_LIBRARY_ADD_FOLDERS): {
            const folders    = payload.folders;
            let musicFolders = app.config.get('musicFolders');

            // Check if we received folders
            if(folders !== undefined) {
                musicFolders = musicFolders.concat(folders);

                // Remove duplicates, useless children, ect...
                musicFolders = utils.removeUselessFolders(musicFolders);

                musicFolders.sort();

                app.config.set('musicFolders', musicFolders);
                app.config.saveSync();
            }

            return { ...state };
        }

        case(AppConstants.APP_LIBRARY_REMOVE_FOLDER): {

            if(!state.refreshingLibrary) {

                const musicFolders = app.config.get('musicFolders');

                musicFolders.splice(payload.index, 1);

                app.config.set('musicFolders', musicFolders);
                app.config.saveSync();

                return { ...state };
            }

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

        case(AppConstants.APP_LIBRARY_SET_TRACKSCURSOR): {
            return {
                ...state,
                tracksCursor: payload.cursor
            };
        }

        default: {
            return state;
        }
    }
};
