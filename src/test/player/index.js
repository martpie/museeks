import Promise from 'bluebird';
import extend from 'deep-extend';
import test from 'tape';

import playerActions from '../../shared/redux/actions/player';

import store from '../store';

import createLib from '../../shared/lib';

const lib = createLib({});

const player = playerActions(lib);

const actionTest = (action, delta, description) => (t) => {
    // how many ms to wait before action completes
    const actionTimeout = 5;

    const actionPromise = store.dispatch(action);
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, actionTimeout));

    // wait for any actions to be applied
    Promise.race([actionPromise, timeoutPromise]).then(() => {
        const stateAfter = store.getState();
        const expectedState = extend({}, stateAfter, delta);

        t.deepEqual(stateAfter, expectedState, description);
        t.end();
    });
};

const delta = {
    player: {
        shuffle: true
    }
};

test('player reducer next', actionTest(
    player.shuffle(true),
    delta,
    'shuffle should set the shuffle property to true'
));
