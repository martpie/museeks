/************************************************************
When our player has observers (another computer using us as
an output) we must notify them of any updates. Primarily,
these are the core player actions such as load, play pause
etc. By sending the action payload to the observer we are
able to easily synchronise the player state.
************************************************************/

import http from 'axios';
import utils from '../../../shared/utils/utils';

// These are all the actions that our observers are interested
// in. Note that these are PENDING and REJECTED events. This
// is because the reducers update the state on PENDING not
// FULFILLED (for a more responsive UI).
const observerActions = [
    // Load
    'PLAYER/LOAD_PENDING',
    'PLAYER/LOAD_REJECTED',
    // Play
    'PLAYER/PLAY_PENDING',
    'PLAYER/PLAY_REJECTED',
    // Pause
    'PLAYER/PAUSE_PENDING',
    'PLAYER/PAUSE_REJECTED',
    // Stop
    'PLAYER/STOP_PENDING',
    'PLAYER/STOP_REJECTED',
    // Shuffle
    'PLAYER/SHUFFLE_PENDING',
    'PLAYER/SHUFFLE_REJECTED',
    // Repeat
    'PLAYER/REPEAT_PENDING',
    'PLAYER/REPEAT_REJECTED',
    // Jump to
    'PLAYER/JUMP_TO_PENDING',
    'PLAYER/JUMP_TO_REJECTED',
    // Elapsed time ( once per second)
    'PLAYER/UPDATE_ELAPSED_TIME',
    // Set Volume
    'PLAYER/SET_VOLUME_FULFILLED',
    'PLAYER/SET_VOLUME_REJECTED',
];

const sendToObservers = (store) => (next) => (action) => {
    const { type, payload } = action;
    const { network : { observers } } = store.getState();

    // If the observers are interested in this action...
    if (observerActions.includes(action.type)) {

        // Create the function to call the observer's dispatch endpoint
        const sendActionToObserver = (observer) => {
            return http({
                url: utils.dispatchEndpoint({ peer: observer }),
                method: 'POST',
                data: action
            })
        };

        // Send the action to all observers for replaying
        observers.forEach(sendActionToObserver);
    }

    return next(action);
};

export default sendToObservers;
