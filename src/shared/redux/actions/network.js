import Promise from 'bluebird';
import os from 'os';
import { uniqBy, flatten, compact } from 'lodash';
import utils from '../../utils/utils';

const library = (lib) => {
    const init = () => (disaptch) => {
        disaptch(find());
        disaptch(setMe());
    };

    const setMe = () => {
        const interfaces = flatten(Object.values(os.networkInterfaces()));
        const networks = interfaces.filter(adapter => adapter.family === 'IPv4' && !adapter.internal);

        return {
            type: 'NETWORK/SET_ME',
            payload: {
                ips: networks.map(network => network.address),
                hostname: os.hostname(),
                platform: os.platform(),
            }
        }
    };

    const peerFound = (peer) => (dispatch, getState) => {
        const me = getState().network.me;
        if (me.hostname != peer.hostname) {
            dispatch(lib.actions.network.find());
        }
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

    const setOutput = (newOutput) => (dispatch, getState) => {
        const { network : { output: prevOutput }, network : { me } } = getState();

        // Add the isLocal bool to the output object for convenience elsewhere.
        const isLocal = newOutput.hostname === me.hostname;
        const newOutputWithLocalBool = { ...newOutput, isLocal };


        // If the output has not changed, do nothing.
        if (prevOutput && prevOutput.hostname === newOutput.hostname) {
            return;
        }

        // If output has swapped to our computer
        if (isLocal) {
            // Ask the previous output for us to be removed as an observer
            // This may fail if the other Museeks stops working.
            // If so, this is fine... Probably...
            lib.api.actions.network.removeObserver(prevOutput, utils.getMeWithIP(me, prevOutput));

            // Dispatch the change event to update the ui
            // This has promise.resolve so we get fulfilled events
            // to match the other case.
            dispatch({
                type: 'NETWORK/SET_OUTPUT',
                payload: Promise.resolve(),
                meta: { newOutput: newOutputWithLocalBool, prevOutput }
            })
        }
        // If output has changed to another computer
        else {
            // We ask the output device to set us as an observer.
            dispatch({
                type: 'NETWORK/SET_OUTPUT',
                payload: lib.api.actions.network.addObserver(newOutput, utils.getMeWithIP(me, newOutput)),
                meta: { newOutput: newOutputWithLocalBool, prevOutput }
            });
        }
    }

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
        init,
        setMe,
        peerFound,
        find,
        start,
        setOutput,
        addObserver,
        removeObserver,
        fetchCover
    };
}

export default library;
