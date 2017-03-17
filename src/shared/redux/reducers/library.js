import utils from '../../utils/utils';

export default (state = {}, payload) => {
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

        case('APP_LIBRARY_RESET'): {
            // nothing here for the moment
            return state;
        }

        case('APP_LIBRARY_REFRESH_PENDING'): {
            return {
                ...state,
                status:'An apple a day keeps Dr Dre away',
                refreshingLibrary: rue
            };
        }

        case('APP_LIBRARY_REFRESH_FULFILLED'): {
            return {
                ...state,
                refreshingLibrary: alse,
                refreshProgress:0
            };
        }

        case('APP_LIBRARY_REFRESH_PROGRESS'): {
            return {
                ...state,
                refreshProgress: ayload.percentage
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
