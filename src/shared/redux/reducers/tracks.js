import i from 'icepick';
import { unionBy, keyBy } from 'lodash';
import extend from 'xtend';
import utils from '../../utils/utils';


export default (state = {}, action) => {
    switch (action.type) {

        case('TRACKS/FIND_FULFILLED'): {
            // return i.assocIn(state, ['network', 'tracks'], action.payload.tracks);
            // add the peer who owns the track as metadata

            const tracksWithMetadata = action.payload.map((track) => extend(track, { owner: action.meta.owner }));

            const uniqueTracks = extend(state.library.data, keyBy(tracksWithMetadata, '_id'));
            const uniqueTrackIds = Object.keys(uniqueTracks);

            return i.chain(state)
                .assocIn(['library', 'data'], uniqueTracks)
                .assocIn(['library', 'all'], uniqueTrackIds)
                .assocIn(['library', 'sub'], uniqueTrackIds)
                .value();
        }

        case('TRACKS/SET_TRACKSCURSOR'): {
            return i.assocIn(state, ['tracksCursor'], action.payload.cursor);
        }

        case('TRACKS/DELETE_FULFILLED'): {
            // const otherTracks = tracks.filter((track) => track.owner !== me);
            return {
                ...state,
                library: {
                    data: {},
                    all: [],
                    sub: []
                },
                playlist: {
                    data: {},
                    all: [],
                    sub: []
                }
        };
        }

        case('TRACKS/FILTER'): {
            if (!action.payload.search || action.payload.search === '') {
                return i.assocIn(state, [state.tracksCursor, 'sub'], [...state[state.tracksCursor].all]);
            } else {

                const search = utils.stripAccents(action.payload.search);

                const tracks = state[state.tracksCursor].all.filter((trackId) => {
                    const track = state[state.tracksCursor].data[trackId];
                    return track.loweredMetas.artist.join(', ').includes(search)
                        || track.loweredMetas.album.includes(search)
                        || track.loweredMetas.genre.join(', ').includes(search)
                        || track.owner.hostname.toLowerCase().includes(search)
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
                .assocIn(['library', 'data'], state.library.data.map(updateTrackPlaycount))
                .value();
        }

        default: {
            return state;
        }
    }
};
