import i from 'icepick';
import { keyBy, orderBy, values, get } from 'lodash';
import extend from 'xtend';
import utils from '../../utils/utils';

export default (state = {}, action) => {
    switch (action.type) {

        case ('TRACKS/FIND_FULFILLED'): {
            // return i.assocIn(state, ['network', 'tracks'], action.payload.tracks);
            // add the peer who owns the track as metadata

            const { owner } = action.meta;

            const trackWithMetadata = (track) => ({
                ...track,
                cover: utils.coverEndpoint({
                    _id: track._id,
                    peer: owner
                }),
                owner
            });
            const tracksWithMetadata = action.payload.map(trackWithMetadata);

            const uniqueTracks = extend(state.library.data, keyBy(tracksWithMetadata, '_id'));
            const uniqueTrackIds = Object.keys(uniqueTracks);

            return i.chain(state)
                .assocIn(['library', 'data'], uniqueTracks)
                .assocIn(['library', 'all'], uniqueTrackIds)
                .assocIn(['library', 'sub'], uniqueTrackIds)
                .value();
        }

        case ('TRACKS/SET_TRACKSCURSOR'): {
            return i.assocIn(state, ['tracksCursor'], action.payload.cursor);
        }

        case ('TRACKS/DELETE_FULFILLED'): {
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

        case ('TRACKS/FILTER'): {
            if (!action.payload.search || action.payload.search === '') {
                return i.assocIn(state, [state.tracksCursor, 'sub'], [...state[state.tracksCursor].all]);
            } else {
                const search = utils.stripAccents(action.payload.search);

                const tracks = state[state.tracksCursor].all.filter((trackId) => {
                    const track = state.library.data[trackId];
                    return track.loweredMetas.artist.join(', ').includes(search) ||
                        track.loweredMetas.album.includes(search) ||
                        track.loweredMetas.genre.join(', ').includes(search) ||
                        track.owner.hostname.toLowerCase().includes(search) ||
                        track.loweredMetas.title.includes(search);
                });

                return i.assocIn(state, [state.tracksCursor, 'sub'], tracks);
            }
        }

        case ('TRACKS/SORT'): {

            // Get the orderBy Arrays
            // This is the array of key names and direction for _.orderBy
            // First we order the columns by sortAdded
            const columnVals = values(state.columns.data);
            const columnValsSortedByTime = orderBy(columnVals, 'sortAdded', 'asc');
            // Now reduce to get the two array.
            const getOrderArrays = columnValsSortedByTime.reduce((acc, val) => {
                if (val.sort) {
                    acc[0].push(val.sortKey);
                    acc[1].push(val.sort);
                }
                return acc;
            }, [[], []]);

            // Now, we can do the real sort
            const sortTracks = (trackIds) => {
                const trackData = trackIds.map((trackId) => state.library.data[trackId]);
                const sortFunction = (nestedSortKey) => (item) => get(item, nestedSortKey);
                const sortFunctions = getOrderArrays[0].map(sortFunction);
                const sortedData = orderBy(trackData, sortFunctions, getOrderArrays[1]);
                return sortedData.map((data) => data._id);
            };
            return i.updateIn(state, [state.tracksCursor, 'sub'], sortTracks);
        }

        case ('TRACKS/TOGGLE_SORT'): {
            return i.chain(state)
                .assocIn(['columns', 'data', action.payload.id, 'sort'], action.payload.state)
                .assocIn(['columns', 'data', action.payload.id, 'sortAdded'], new Date().getTime())
                .value();
        }

        case ('TRACKS/SET_COLUMN_WIDTH'): {
            return i.assocIn(state, ['columns', 'data', action.payload.id, 'width'], action.payload.width);
        }

        case ('TRACKS/PLAY_COUNT_INCREMENT_FULFILLED'): {
            const { _id } = action.meta;

            const updateTrackPlaycount = (track) => track === _id
                ? extend(track, {
                    playCount: isNaN(track.playCount) ? 0 : track.playCount + 1,
                })
                : track;

            return i.updateIn(state, ['library', 'data', _id], updateTrackPlaycount);
        }

        default: {
            return state;
        }
    }
};
