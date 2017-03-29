import Promise from 'bluebird';
import extend from 'deep-extend';
import { diff } from 'deep-object-diff';

import { store, setState } from './store';

// how many ms to wait before action tests timeout
const actionTimeout = 5;

// capture the clean state of the store before any tests have run
const cleanState = store.getState();

// take in an action, an expected delta, and an optional initial state
const actionTest = ({ initialState = {}, action }) => {
    // set the state for the test
    const state = extend(cleanState, initialState);
    store.dispatch(setState(state));

    // dispatch our test action and a timeout to race
    const actionPromise = store.dispatch(action);
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, actionTimeout));

    // wait for the action(s) to be applied
    return Promise.race([actionPromise, timeoutPromise]).then(() => {
        const actualState = store.getState();
        const actualDelta = diff(state, actualState);

        return {
            state: actualState,
            delta: actualDelta
        };
    });
};

export default actionTest;
