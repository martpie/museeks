export default (state = {}, payload) => {
    switch (payload.type) {

        case('PLAYLISTS/REFRESH'): {
            return {
                ...state,
                playlists: payload.playlists ? payload.playlists : []
            };
        }

        case('PLAYLISTS/LOAD_ONE'): {
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
