import test from 'blue-tape';
import playerActions from '../../shared/redux/actions/player';
import actionTest from '../fixtures/redux/actionTest';
import lib from '../fixtures/lib';

const player = playerActions(lib);

test('player reducer shuffle', (t) => {
    const description = 'shuffle should set the shuffle property to true';

    const action = player.shuffle(true);

    const delta = {
        player: {
            shuffle: true
        }
    };

    return actionTest({
        action,
        delta
    })
    .then((result) => t.deepEqual(result.delta, delta, description));
});

test('player reducer next', (t) => {

    const description = 'next should increment the queue cursor';

    const action = player.next();

    const initialState = {
        queueCursor: 5,
        player: {
            playStatus: 'play'
        }
    };

    const delta = {
        queueCursor: 6
    };

    return actionTest({
        initialState,
        action
    })
    .then((result) => t.deepEqual(result.delta, delta, description));
});
