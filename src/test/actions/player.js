import test from 'blue-tape';
import playerActions from '../../shared/redux/actions/player';
import actionTest from '../fixtures/redux/actionTest';
import lib from '../fixtures/lib';

const player = playerActions(lib);

test('player reducer next', (t) => {

    const description = 'shuffle should set the shuffle property to true';

    const action = player.shuffle(true);

    const initialState = {
    }

    const delta = {
        player: {
            shuffle: true
        }
    };

    return actionTest({
        // initialState,
        action,
        delta
    })
    .then((result) => t.deepEqual(result.expectedState, result.actualState, description))
    .then(() => {

    });
});
