export default (state = {}, payload) => {
    switch (payload.type) {

        case('PLAYLISTS/REFRESH'): {
            return payload.playlists || [];
        }

        // TODO: BROKEN BY MOVE TO COMBINE REDUCERS. FIX.
        case('PLAYLISTS/LOAD_ONE'): {
            const newState = { ...state };
            newState.tracks[state.tracks.tracksCursor] = {
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
