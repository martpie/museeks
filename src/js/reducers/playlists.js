import AppConstants from '../constants/AppConstants';

export default (state = {}, payload) => {
    switch (payload.type) {

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
