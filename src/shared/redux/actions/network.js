import Promise from 'bluebird';
import { uniqBy, flatten, compact } from 'lodash';
import utils from '../../utils/utils';

const library = (lib) => {

    const peerFound = (peer) => ({
        type: 'APP_NETWORK_PEER_FOUND',
        payload: {
            peer
        }
    });

    const find = ({ peers = [], query, sort } = {}) => (dispatch, getState) => {

        // if no peers were supplied, search all peers
        if (peers.length === 0) {
            peers = getState().network.peers;
        }

        const getLibrary = (peer) => lib.network.find({ peer, query, sort });
        const queryPeers = Promise.map(peers, getLibrary);

        const uniqueTracks = (tracks) => uniqBy(tracks, '_id');

        return queryPeers
        .then(flatten)
        .then(uniqueTracks)
        .then((tracks) => dispatch({
            type: 'APP_NETWORK_FIND',
            payload: {
                tracks
            }
        }));
    };

    const findOne = ({ peers = [], query } = {}) => (dispatch, getState) => {

        // if no peers were supplied, search all peers
        if (peers.length === 0) {
            peers = getState().network.peers;
        }

        const getSong = (peer) => lib.network.findOne({ peer, query });
        const queryPeers = Promise.map(peers, getSong);

        return queryPeers
        .then(flatten)
        .then(compact)
        .then((track) => dispatch({
            type: 'APP_NETWORK_FIND_ONE',
            payload: {
                track
            }
        }));
    };

    const start = ({ source, destination, track } = {}) => {
        return {
            type: 'APP_NETWORK_START',
            payload: {
                peer
            }
        }
    };

    const addObserver = (peer) => ({
        type: 'APP_NETWORK_ADD_OBSERVER',
        payload: {
            peer
        }
    });

    const removeObserver = (peer) => ({
        type: 'APP_NETWORK_REMOVE_OBSERVER',
        payload: {
            peer
        }
    });

    const fetchCover = (_id) => (dispatch) => {
        return lib.network.getOwner({ _id }).then((peer) => {
            dispatch({
                type: 'APP_NETWORK_FETCH_COVER',
                payload: {
                    path: `${lib.utils.peerEndpoint(peer)}/api/network/fetchCover?_id=${_id}`
                }
            });
        });
    };

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
