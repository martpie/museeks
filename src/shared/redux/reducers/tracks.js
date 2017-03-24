import i from 'icepick';
import { unionBy } from 'lodash';
import extend from 'xtend';

export default (state = {}, action) => {
    switch (action.type) {

        case('TRACKS/FIND_FULFILLED'): {
            // return i.assocIn(state, ['network', 'tracks'], action.payload.tracks);
            // add the peer who owns the track as metadata

            const tracksWithMetadata = action.payload.map((track) => extend(track, { owner: action.meta.owner }));

            const uniqueTracks = unionBy(tracksWithMetadata, state.library.all, '_id');

            return i.chain(state)
                .assocIn(['library', 'all'], uniqueTracks)
                .assocIn(['library', 'sub'], uniqueTracks)
                .value();
        }

        case('TRACKS/SET_TRACKSCURSOR'): {
            return i.assocIn(state, ['tracksCursor'], action.payload.cursor);
        }

        case('TRACKS/DELETE_FULFILLED'): {
            // const otherTracks = tracks.filter((track) => track.owner !== me);
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

        case('TRACKS/FILTER'): {
            if (!action.payload.search) {
                const newState = { ...state };
                newstate[state.tracksCursor].sub = [...state[state.tracksCursor].all];

                return newState;
            }

            const search = utils.stripAccents(action.payload.search);

            const allCurrentTracks = state[state.tracksCursor].all;
            const tracks = [].concat(allCurrentTracks).filter((track) => { // Problem here
                return track.loweredMetas.artist.join(', ').includes(search)
                    || track.loweredMetas.album.includes(search)
                    || track.loweredMetas.genre.join(', ').includes(search)
                    || track.loweredMetas.title.includes(search);
            });

            const newState = { ...state };
            newstate[state.tracksCursor].sub = tracks;

            return newState;
        }

        default: {
            return state;
        }
    }
};
