import Promise from 'bluebird';
import os from 'os';
import { flatten } from 'lodash';
import utils from '../../utils/utils';

const library = (lib) => {

    const peerFound = (peer) => (dispatch, getState) => {
        const me = getState().network.me;
        if (me.hostname !== peer.hostname) {
            dispatch({
                type: 'NETWORK/PEER_FOUND',
                payload: {
                    peer
                }
            });
            dispatch(lib.actions.track.find({ peer }));
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
        peerFound,
        setOutput,
        addObserver,
        removeObserver,
        fetchCover
    };
}

export default library;
