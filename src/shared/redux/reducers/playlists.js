import i from 'icepick';

export default (state = {}, action) => {
    switch (action.type) {

        case ('PLAYLISTS/REFRESH'): {
            return i.assocIn(state, ['playlists'], action.payload.playlists);
        }
        case ('PLAYLISTS/LOAD_ONE'): {
            const trackIds = action.payload.tracks.map((track) => track._id);
            return i.chain(state)
                .assocIn(['tracks', state.tracks.tracksCursor, 'all'], trackIds)
                .assocIn(['tracks', state.tracks.tracksCursor, 'sub'], trackIds)
                .value();
        }

        default: {
            return state;
        }
    }
};
