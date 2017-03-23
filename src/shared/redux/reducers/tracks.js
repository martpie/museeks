import i from 'icepick';
import { unionBy } from 'lodash';
import extend from 'xtend';

export default (state = {}, action) => {
    switch (action.type) {

        case('TRACKS/FIND_FULFILLED'): {
            // return i.assocIn(state, ['network', 'tracks'], action.payload.tracks);
            // add the peer who owns the track as metadata

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

        case('TRACKS/SET_TRACKSCURSOR'): {
            return i.assocIn(state, ['tracks', 'tracksCursor'], action.payload.cursor);
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
        // case('TRACKS/FILTER'): {
        //     if (!action.payload.search) {
        //         const newState = { ...state };
        //         newState.tracks[state.tracks.tracksCursor].sub = [...state.tracks[state.tracks.tracksCursor].all];
        //
        //         return newState;
        //     }
        //
        //     const search = utils.stripAccents(action.payload.search);
        //
        //     const allCurrentTracks = state.tracks[state.tracks.tracksCursor].all;
        //     const tracks = [].concat(allCurrentTracks).filter((track) => { // Problem here
        //         return track.loweredMetas.artist.join(', ').includes(search)
        //             || track.loweredMetas.album.includes(search)
        //             || track.loweredMetas.genre.join(', ').includes(search)
        //             || track.loweredMetas.title.includes(search);
        //     });
        //
        //     const newState = { ...state };
        //     newState.tracks[state.tracks.tracksCursor].sub = tracks;
        //
        //     return newState;
        // }

        // const play = ({ source, destination, track } = {}) => {
        //     return {
        //         type: 'NETWORK/START',
        //         payload: {
        //             peer
        //         }
        //     }
        // };

        default: {
            return state;
        }
    }
};
