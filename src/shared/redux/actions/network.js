import Promise from 'bluebird';
import os from 'os';
import extend from 'xtend';
import { flatten, pick } from 'lodash';
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
            dispatch(lib.actions.tracks.find({ peer }));
        }
    };

    const setOutput = (newOutput) => (dispatch, getState) => {
        const state = getState();
        const { network : { output: prevOutput }, network : { me } } = state;

        // If the output has not changed, do nothing.
        if (prevOutput && prevOutput.hostname === newOutput.hostname) {
            return;
        }

        const getPlayerState = () => {

            const playerState = [
                'player',
                'queue',
                'queueCursor'
            ];

            return {
                ...pick(state, playerState),
                elapsed: lib.player.getCurrentTime()
            }
        };

        // Add the isLocal bool to the output object for convenience elsewhere.
        const isLocal = newOutput.hostname === me.hostname;
        const newOutputWithIsLocal = { ...newOutput, isLocal };

        // If output has swapped to our computer
        if (isLocal) {
            // Ask the previous output for us to be removed as an observer
            // This may fail if the other Museeks stops working.
            // If so, this is fine... Probably...
            lib.api.actions.network.disconnectAsOutput(prevOutput, {
                peer: utils.getMeWithIP(me, prevOutput)
            });

            // Dispatch the change event to update the ui
            // This has promise.resolve so we get fulfilled events
            // to match the other case.
            dispatch({
                type: 'NETWORK/SET_OUTPUT',
                payload: Promise.resolve(),
                meta: {
                    newOutput: newOutputWithIsLocal,
                    prevOutput
                }
            })

        } else { // If output has changed to another computer

            const meWithIP = utils.getMeWithIP(me, newOutput);
            const playerState = getPlayerState();
            playerState.queue = playerState.queue.map((track) => track.owner.hostname === me.hostname
                ? extend(track, {
                    path: lib.utils.trackEndpoint({
                        _id: track._id,
                        peer: me
                    }),
                    owner: meWithIP
                })
                : track
            );

            // We ask the output device to set us as an observer.
            dispatch({
                type: 'NETWORK/SET_OUTPUT',
                payload: lib.api.actions.network.connectAsOutput(newOutput, {
                    peer: meWithIP,
                    state: playerState
                }),
                meta: {
                    newOutput: newOutputWithIsLocal,
                    prevOutput
                }
            });
        }
    };

    const connectAsOutput = ({ state, peer }) => (dispatch) => {
        console.log(state, peer)
        // Stop the player from playing
        dispatch(lib.actions.player.stop());

        // Apply the input's state

        // Set the queue
        dispatch(lib.actions.queue.setQueue(state.queue));

        // Load the track
        dispatch(lib.actions.player.load(state.queue[state.queueCursor]._id));

        // Set the play/pause/stop status
        if (state.player.playStatus === 'pause') {
            dispatch(lib.actions.player.pause());
        } else if (state.player.playStatus === 'stop') {
            dispatch(lib.actions.player.stop());
        } else if (state.player.playStatus === 'play') {
            dispatch(lib.actions.player.play());
        }

        // Set repeat
        dispatch(lib.actions.player.repeat(state.player.repeat));

        // Set Shuffle
        dispatch(lib.actions.player.shuffle(state.player.shuffle));

        // Set the elapsed time
        dispatch(lib.actions.player.jumpTo(state.elapsed));

        // Add the input computer as an observer
        dispatch(lib.actions.network.addObserver(peer));
    };

    const disconnectAsOutput = ({ peer }) => (dispatch) => {
        dispatch(removeObserver({ peer }));
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
        setOutput,
        connectAsOutput,
        disconnectAsOutput,
        addObserver,
        removeObserver
    };
}

export default library;
