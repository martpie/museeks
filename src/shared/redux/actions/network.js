const flatten = require('flatten');

const library = (lib) => {

    const peerFound = (peer) => ({
        type: 'APP_NETWORK_PEER_FOUND',
        payload: {
            peer
        }
    });

    const find = ({ sources, query, sort }) => {

        const getLibrary = (source) => lib.api.track.find({ query, sort });
        const querySources = Promise.map(sources, getLibrary);

        const uniqueTracks = (tracks) => tracks;

        const dispatch = (tracks) => lib.store.dispatch({
            type: 'APP_NETWORK_FIND',
            payload: {
                tracks
            }
        });

        return querySources
        .then(flatten)
        .then(uniqueTracks)
        .then(dispatch);
    };

    const start = ({ source, destination, track }) => {
        const getLibrary = (source) => lib.api.network.start(req.query);
        const querySources = Promise.map(req.query.sources, getLibrary);

        return querySources
        .then(flatten)
        .then(res);

        return  {
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
        addObserver,
        removeObserver
    };
}

export default library;
