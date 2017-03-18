import extend from 'xtend';
import utils from '../../utils/utils';

export default (state = {}, action) => {
    switch (action.type) {
        case('APP_FILTER_SEARCH'): {
            if (!action.payload.search) {
                const newState = { ...state };
                newState.tracks[state.tracksCursor].sub = [...state.tracks[state.tracksCursor].all];

                return newState;
            }

            const search = utils.stripAccents(action.payload.search);

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

        case('APP_LIBRARY_UPDATE_FOLDERS'): {
            const config = extend(state.config, { musicFolders: action.payload.folders });
            return {
                ...state,
                config
            };
        }

        case('APP_LIBRARY_REMOVE_FOLDER'): {
            if (!state.refreshingLibrary) {
                const musicFolders = app.config.get('musicFolders');

                musicFolders.splice(payload.index, 1);

                app.config.set('musicFolders', musicFolders);
                app.config.saveSync();

                return { ...state };
            }

            return state;
        }

        case('APP_LIBRARY_FETCHED_COVER'): {
            return {
                ...state,
                cover: action.payload.cover || null
            };
        }

        case('APP_LIBRARY_RESET'): {
            // nothing here for the moment
            return state;
        }

        case('APP_LIBRARY_REFRESH_PENDING'): {
            return {
                ...state,
                status: 'An apple a day keeps Dr Dre away',
                refreshingLibrary: true
            };
        }

        case('APP_LIBRARY_REFRESH_FULFILLED'): {
            return {
                ...state,
                refreshingLibrary: false,
                refreshProgress: 0
            };
        }

        case('APP_LIBRARY_REFRESH_PROGRESS'): {
            return {
                ...state,
                refreshProgress: action.payload.percentage
            };
        }

        case('APP_LIBRARY_SET_TRACKSCURSOR'): {
            return {
                ...state,
                tracksCursor: action.payload.cursor
            };
        }

        default: {
            return state;
        }
    }
};
