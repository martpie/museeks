import Promise from 'bluebird';
import flatten from 'flatten';

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
            peers = getState().peers;
        }

        const getLibrary = (peer) => lib.network.find({ peer, query, sort });
        const queryPeers = Promise.map(peers, getLibrary);

        const uniqueTracks = (tracks) => tracks;

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

    const start = ({ source, destination, track } = {}) => {
        const getLibrary = (source) => lib.api.network.start(req.query);
        const querySources = Promise.map(req.query.sources, getLibrary);

        return querySources
        .then(flatten)
        .then(res);

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

    return {
        peerFound,
        find,
        start,
        addObserver,
        removeObserver
    };
}

export default library;
