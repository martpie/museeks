import Promise from 'bluebird';
import { uniqBy, flatten, compact } from 'lodash';
import utils from '../../utils/utils';

const library = (lib) => {

    const peerFound = (peer) => (dispatch) => {
        dispatch(lib.actions.network.find());
        dispatch({
            type: 'NETWORK/PEER_FOUND',
            payload: {
                peer
            }
        });
    };

    const find = ({ peers = [], query, sort } = {}) => (dispatch, getState) => {

        // if no peers were supplied, search all peers
        if (peers.length === 0) {
            peers = getState().network.peers;
        }

        const getLibrary = (peer) => lib.network.find({ peer, query, sort });
        const queryPeers = Promise.map(peers, getLibrary);

        const uniqueTracks = (tracks) => uniqBy(tracks, '_id');

        const tracks = queryPeers
        .then(flatten)
        .then(uniqueTracks);

        dispatch({
            type: 'NETWORK/FIND',
            payload: tracks
        });
    };

    const findOne = ({ peers = [], query } = {}) => (dispatch, getState) => {

        // if no peers were supplied, search all peers
        if (peers.length === 0) {
            peers = getState().network.peers;
        }

        const getSong = (peer) => lib.network.findOne({ peer, query });
        const queryPeers = Promise.map(peers, getSong);

        const track = queryPeers
        .then(flatten)
        .then(compact);

        dispatch({
            type: 'NETWORK/FIND_ONE',
            payload: track
        });
    };

    const start = ({ source, destination, track } = {}) => {
        return {
            type: 'NETWORK/START',
            payload: {
                peer
            }
        }
    };

    const addObserver = (peer) => ({
        type: 'NETWORK/ADD_OBSERVER',
        payload: {
            peer
        }
    });

    const removeObserver = (peer) => ({
        type: 'NETWORK/REMOVE_OBSERVER',
        payload: {
            peer
        }
    });

    const fetchCover = (metadata) => ({
        type: 'NETWORK/FETCHED_COVER',
        payload: {
            cover: `${lib.utils.peerEndpoint(metadata.owner)}/api/track/fetchCover?_id=${metadata._id}`
        }
    });

    return {
        peerFound,
        find,
        start,
        addObserver,
        removeObserver,
        fetchCover
    };
}

export default library;
