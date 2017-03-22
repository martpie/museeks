import extend from 'xtend';
import utils from '../../utils/utils';

export default (state = {}, action) => {
    switch (action.type) {
        case('LIBRARY/FILTER'): {
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

        case('LIBRARY/UPDATE_FOLDERS'): {
            const config = extend(state.config, { musicFolders: action.payload.folders });
            return {
                ...state,
                config
            };
        }

        case('LIBRARY/RESCAN_PENDING'): {
            return {
                ...state,
                status: 'An apple a day keeps Dr Dre away',
                refreshingLibrary: true
            };
        }

        case('LIBRARY/RESCAN_FULFILLED'): {
            return {
                ...state,
                refreshingLibrary: false,
                refreshProgress: 0
            };
        }

        case('LIBRARY/RESCAN_PROGRESS'): {
            return {
                ...state,
                refreshProgress: action.payload.percentage
            };
        }

        case('LIBRARY/SET_TRACKSCURSOR'): {
            return {
                ...state,
                tracksCursor: action.payload.cursor
            };
        }

        case('LIBRARY/DELETE_FULFILLED'): {
            return {
                ...state,
                tracks: {
                    library: {
                        all: [],
                        sub: []
                    },
                    playlist: {
                        all: [],
                        sub: []
                    }
                }
            };
        }

        default: {
            return state;
        }
    }
};
