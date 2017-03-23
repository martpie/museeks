import Promise from 'bluebird';
import os from 'os';
import { flatten, pick } from 'lodash';
import utils from '../../utils/utils';

const library = (lib) => {

    const getPlayerState = () => (dispatch, getState) => {
        const state = getState();

        const properites = [
            'player',
            'queue',
            'queueCursor'
        ];

        const storeState = pick(state, properites);

        const otherState = {
            elapsed: lib.player.getCurrentTime(),
        };

        return {
            ...storeState
            ...otherState
        }
    };

    const peerFound = (peer) => (dispatch, getState) => {
        const me = getState().network.me;
        if (me.hostname !== peer.hostname) {
            dispatch({
                type: 'NETWORK/PEER_FOUND',
                payload: {
                    peer
                }
            });
            dispatch(lib.actions.tracks.find({ peer }));
        }
    };

    const setOutput = (newOutput) => (dispatch, getState) => {
        console.log(dispatch(getPlayerState()));
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
    };

    const becomeRemoteOutput = (inputState) => (dispatch) => {
        // Stop the player from playing
        dispatch(lib.actions.player.stop());

        // Apply the input's state
        // Set the queue
        dispatch(lib.actions.queue.setQueue(inputState.queue));
        // Set the queueCursor
        dispatch(lib.actions.queue.start(inputState.queueCursor));
        // Set the play/pause/stop status
        if (inputState.player.playerStatus === 'pause') {
            dispatch(lib.actions.player.start(inputState.queueCursor));
        } else if (inputState.player.playerStatus === 'stop') {
            dispatch(lib.actions.player.stop(inputState.queueCursor));
        } else  if (inputState.player.playerStatus === 'play') {
            dispatch(lib.actions.player.play(inputState.queueCursor));
        }
        // Set the elapsed time
        dispatch(lib.actions.player.jumpTo(inputState.elapsed));



    };

    const addObserver = ({ ip, hostname, platform }) => ({
        type: 'NETWORK/ADD_OBSERVER',
        payload: {
            peer: {
                ip,
                hostname,
                platform
            }
        }
    });

    const removeObserver = (peer) => ({
        type: 'NETWORK/REMOVE_OBSERVER',
        payload: {
            peer
        }
    });

    return {
        peerFound,
//        becomeRemoteOutput,
        setOutput,
        addObserver,
        removeObserver
    };
}

export default library;
