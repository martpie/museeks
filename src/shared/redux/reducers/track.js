import i from 'icepick';
import { unionBy } from 'lodash';
import extend from 'xtend';

export default (state = {}, action) => {
    switch (action.type) {

        case('TRACK/FIND_FULFILLED'): {
            // return i.assocIn(state, ['network', 'tracks'], action.payload.tracks);
            // add the peer who owns the track as metadata
console.log(action)
            const tracksWithMetadata = action.payload.map((track) => extend(track, { owner: action.meta.owner }));

            const uniqueTracks = unionBy(tracksWithMetadata, state.tracks.library.all, '_id');

            return {
                ...state,
                tracks: {
                    library: {
                        all: uniqueTracks,
                        sub: uniqueTracks
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
