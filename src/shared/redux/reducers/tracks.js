import i from 'icepick';
import { unionBy } from 'lodash';
import extend from 'xtend';
import utils from '../../utils/utils';

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
            if (!action.payload.search || action.payload.search === '') {
                return i.assocIn(state, [state.tracksCursor, 'sub'], [...state[state.tracksCursor].all]);
            } else {

                const search = utils.stripAccents(action.payload.search);

                const tracks = state[state.tracksCursor].all.filter((track) => {
                    return track.loweredMetas.artist.join(', ').includes(search)
                        || track.loweredMetas.album.includes(search)
                        || track.loweredMetas.genre.join(', ').includes(search)
                        || track.loweredMetas.title.includes(search);
                });

                return i.assocIn(state, [state.tracksCursor, 'sub'], tracks);
            }

        }

        case('TRACKS/PLAY_COUNT_INCREMENT_FULFILLED'): {

            const updateTrackPlaycount = (track) => track._id === action.meta._id
                ? extend(track, {
                    playCount: track.playCount + 1,
                    playHistory: (track.playHistory || []).concat(action.meta.event)
                })
                : track;

            return i.chain(state)
                .assocIn(['library', 'all'], state.library.all.map(updateTrackPlaycount))
                .assocIn(['library', 'sub'], state.library.sub.map(updateTrackPlaycount))
                .value();
        }

        default: {
            return state;
        }
    }
};
