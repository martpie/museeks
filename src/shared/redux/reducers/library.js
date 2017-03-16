//const app          = require('../lib/app');
const AppConstants = require('../constants/AppConstants');
const utils        = require('../../utils/utils');

module.exports = (state = {}, payload) => {
    switch (payload.type) {
        case('APP_FILTER_SEARCH'): {
            if (!payload.search) {
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

        case('APP_LIBRARY_FETCHED_COVER'): {
            return {
                ...state,
                cover: payload.cover || null
            };
        }

        case('APP_LIBRARY_ADD_FOLDERS'): {
            const folders    = payload.folders;
            let musicFolders = state.config.musicFolders;

            // Check if we received folders
            if (folders !== undefined) {
                musicFolders = musicFolders.concat(folders);

                // Remove duplicates, useless children, ect...
                musicFolders = utils.removeUselessFolders(musicFolders);

                musicFolders.sort();

                lib.config.set('musicFolders', musicFolders);
                lib.config.saveSync();
            }

            return { ...state };
        }

        case('APP_LIBRARY_REMOVE_FOLDER'): {
            if (!state.refreshingLibrary) {
                const musicFolders = state.config.musicFolders;

                musicFolders.splice(payload.index, 1);

                lib.config.set('musicFolders', musicFolders);
                lib.config.saveSync();

                return { ...state };
            }

            return state;
        }

        case('APP_LIBRARY_RESET'): {
            // nothing here for the moment
            return state;
        }

        case('APP_LIBRARY_REFRESH_PENDING'): {
            return {
                ...state,
                status : 'An apple a day keeps Dr Dre away',
                refreshingLibrary : true
            };
        }

        case('APP_LIBRARY_REFRESH_FULFILLED'): {
            return {
                ...state,
                refreshingLibrary : false,
                refreshProgress : 0
            };
        }

        case('APP_LIBRARY_REFRESH_PROGRESS'): {
            return {
                ...state,
                refreshProgress : payload.percentage
            };
        }

        case('APP_LIBRARY_SET_TRACKSCURSOR'): {
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
