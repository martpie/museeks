import Promise from 'bluebird';
import extend from 'deep-extend';

import { store, setState } from './store';

// how many ms to wait before action tests timeout
const actionTimeout = 5;

const cleanState = store.getState();

const actionTest = ({ initialState = {}, action, delta }) => {
    // set an initial state for the test
    const state = extend(cleanState, initialState);
    store.dispatch(setState(state));

    const actionPromise = store.dispatch(action);
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, actionTimeout));

    // wait for the action(s) to be applied
    return Promise.race([actionPromise, timeoutPromise]).then(() => {
        const expectedState = extend({}, state, delta);
        const actualState = store.getState();

        return { expectedState, actualState };
    });
};

export default actionTest;
