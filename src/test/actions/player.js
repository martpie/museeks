import Promise from 'bluebird';
import test from 'blue-tape';
import playerActions from '../../shared/redux/actions/player';
import actionTest from '../fixtures/redux/actionTest';
import lib from '../fixtures/lib';
import { range } from 'range';
import deepExtend from 'deep-extend';
import freeze from 'deep-freeze';

const extend = function() {
    return deepExtend.call(null, {}, ...arguments);
}

const player = playerActions(lib);

const numTracks = 10;
const baseState = {
    tracks: {
        library: {
            data: range(0, numTracks).reduce((data, _id) => {
                data[_id] = {
                    _id,
                    name: `song ${_id}`
                };
                return data;
            }, {})
        }
    },
    queueCursor: 5,
    queue: range(0, numTracks),
    player: {
        playStatus: 'play',
        history: [],
        shuffle: false,
        repeat: 'none'
    }
};
const tracks = baseState.tracks.library.data;

freeze(baseState);

test('player next', (t) => {

    const iterations = range(3);

    const description = `
        should increment the queue cursor,
        should add to history
    `;

    const action = player.next();

    const queueCursor = 5;
    const currentTrackId = baseState.queue[queueCursor];
    const currentTrack = tracks[currentTrackId];

    const initialState = extend(baseState, {
        queueCursor,
        player: {
            playStatus: 'play',
            currentTrack
        }
    });

    return Promise.reduce(iterations, (previous) => {

        const nextQueueCursor = previous.queueCursor + 1;
        const nextTrack = tracks[nextQueueCursor];

        const delta = {
            queueCursor: nextQueueCursor,
            player: {
                currentTrack: nextTrack,
                history: previous.player.history.concat(nextTrack._id)
            }
        };

        return actionTest({
            initialState: previous,
            action
        })
        .then((result) => {
            t.deepEqual(result.delta, delta, description);

            return result.state;
        });
    }, initialState);
});

test('player next with repeat none', (t) => {

    const description = `
        should stop the player once the end of the queue is reached
    `;

    const action = player.next();

    // set the cursor to the end of the queue
    const queueCursor = baseState.queue.length - 1;

    const initialState = extend(baseState, {
        queueCursor,
        player: {
            playStatus: 'play',
            currentTrack: tracks[queueCursor],
            repeat: 'none'
        }
    });

    const delta = {
        player: {
            playStatus: 'stop',
            currentTrack: {
                _id: undefined,
                name: undefined
            }
        }
    };

    return actionTest({
        initialState,
        action
    })
    .then((result) => t.deepEqual(result.delta, delta, description));
});

test('player next with repeat one', (t) => {

    const description = `
        should not increment the queue cursor,
        should not add to history
    `;

    const action = player.next();

    const queueCursor = 5;

    const initialState = extend(baseState, {
        queueCursor,
        player: {
            playStatus: 'play',
            currentTrack: tracks[queueCursor],
            history: [],
            repeat: 'one'
        }
    });

    // expect the state to stay the same
    const delta = {};

    return actionTest({
        initialState,
        action
    })
    .then((result) => t.deepEqual(result.delta, delta, description));
});

test('player next with repeat all', (t) => {

    const description = `
        should set the cursor to the head of the queue once the end is reached,
        should add to history
    `;

    const action = player.next();

    // set the cursor to the end of the queue
    const queueCursor = baseState.queue.length - 1;
    const currentTrackId = baseState.queue[queueCursor];
    const currentTrack = tracks[currentTrackId];

    const initialState = extend(baseState, {
        queueCursor,
        player: {
            playStatus: 'play',
            currentTrack,
            history: [currentTrackId],
            repeat: 'all'
        }
    });

    // next track should be item 0 in the queue
    const nextQueueCursor = 0;
    const nextTrackId = baseState.queue[nextQueueCursor];
    const nextTrack = tracks[nextTrackId];

    const delta = {
        queueCursor: nextQueueCursor,
        player: {
            currentTrack: nextTrack,
            history: [currentTrackId, nextTrackId],
        }
    };

    return actionTest({
        initialState,
        action
    })
    .then((result) => t.deepEqual(result.delta, delta, description));
});

test('player next with repeat one and shuffle on', (t) => {

    const iterations = range(3);

    const description = `
        should not increment the queue cursor,
        should not add to history
    `;

    const action = player.next();

    const queueCursor = 5;

    const initialState = extend(baseState, {
        queueCursor,
        player: {
            playStatus: 'play',
            currentTrack: tracks[queueCursor],
            history: [],
            historyCursor: -1,
            repeat: 'one',
            shuffle: true
        }
    });

    return Promise.reduce(iterations, (previous) => {

        // expect the state to stay the same
        const delta = {};

        return actionTest({
            initialState: previous,
            action
        })
        .then((result) => {
            t.deepEqual(result.delta, delta, description);

            return result.state;
        });
    }, initialState);
});

test('player previous before 5 seconds of playing', (t) => {

    const description = `
        should keep the queue cursor the same,
        should put the history cursor to the end of the history array,
        should not add to history
    `;

    const action = player.previous();

    // force the state of the audio component
    lib.player.getAudio = () => Promise.resolve({
        currentTime: 3
    });

    const queueCursor = 5;
    const currentTrack = tracks[baseState.queue[queueCursor]];

    const initialState = extend(baseState, {
        queueCursor,
        player: {
            playStatus: 'play',
            history: [0, 1, 2, 3, 4],
            currentTrack
        }
    });

    const historyCursor = initialState.player.history.length - 1;
    const historyTrackId = initialState.player.history[historyCursor];
    const historyTrack = tracks[historyTrackId];

    const delta = {
        player: {
            historyCursor,
            currentTrack: historyTrack
        }
    };

    return actionTest({
        initialState,
        action
    })
    .then((result) => t.deepEqual(result.delta, delta, description));
});

test('player previous after 5 seconds of playing', (t) => {

    const description = `
        should keep the queue cursor the same,
        should keep the history cursor the same,
        should not add to history
    `;

    const action = player.previous();

    const queueCursor = 5;
    const currentTrack = tracks[baseState.queue[queueCursor]];

    // force the state of the audio component
    lib.player.getAudio = () => Promise.resolve({
        currentTime: 30
    });

    const initialState = extend(baseState, {
        queueCursor,
        player: {
            playStatus: 'play',
            history: [0, 1, 2, 3, 4],
            currentTrack
        }
    });

    // expect the state to stay the same
    const delta = {};

    return actionTest({
        initialState,
        action
    })
    .then((result) => t.deepEqual(result.delta, delta, description));
});

test('player previous from within the history array', (t) => {

    const iterations = range(3);

    const description = `
        should keep the queue cursor the same,
        should decrement the history cursor,
        should not add to history
    `;

    const action = player.previous();

    // force the state of the audio component
    lib.player.getAudio = () => Promise.resolve({
        currentTime: 3
    });

    const historyCursor = 4;
    const history = [0, 1, 2, 3, 4];
    const historyTrackId = history[historyCursor];
    const currentTrack = tracks[historyTrackId];

    const initialState = extend(baseState, {
        player: {
            playStatus: 'play',
            historyCursor,
            history,
            currentTrack
        }
    });


    return Promise.reduce(iterations, (previous) => {

        const nextHistoryCursor = previous.player.historyCursor - 1;
        const nextTrack = tracks[nextHistoryCursor];

        const delta = {
            player: {
                currentTrack: nextTrack,
                historyCursor: nextHistoryCursor
            }
        };

        return actionTest({
            initialState: previous,
            action
        })
        .then((result) => {
            t.deepEqual(result.delta, delta, description);

            return result.state;
        });
    }, initialState);
});

test('player previous from the head of the history array', (t) => {

    const description = `
        should keep the history cursor the same,
        should not add to history,
        should set the play status to stopped
    `;

    const action = player.previous();

    // force the state of the audio component
    lib.player.getAudio = () => Promise.resolve({
        currentTime: 3
    });

    const historyCursor = 0;
    const history = [0, 1, 2, 3, 4];
    const historyTrackId = history[historyCursor];
    const currentTrack = tracks[historyTrackId];

    const initialState = extend(baseState, {
        player: {
            playStatus: 'play',
            historyCursor,
            history,
            currentTrack
        }
    });

    // expect the state to stay the same
    const delta = {
        player: {
            playStatus: 'stop',
            currentTrack: {
                _id: undefined,
                name: undefined
            }
        }
    };

    return actionTest({
        initialState,
        action
    })
    .then((result) => t.deepEqual(result.delta, delta, description));
});

test('player previous should not be affected by shuffle', (t) => {

    const description = `
        should put the history cursor to the end of the history array,
        should not add to history
    `;

    const action = player.previous();

    // force the state of the audio component
    lib.player.getAudio = () => Promise.resolve({
        currentTime: 3
    });

    const queueCursor = 5;
    const history = [0, 1, 2, 3, 4];
    const currentTrackId = baseState.queue[queueCursor];
    const currentTrack = tracks[queueCursor];

    const initialState = extend(baseState, {
        queueCursor,
        player: {
            playStatus: 'play',
            history,
            currentTrack
        }
    });

    const historyCursor = history.length -1;

    // expect the state to stay the same
    const delta = {
        player: {
            historyCursor,
            currentTrack: tracks[history[historyCursor]]
        }
    };

    return actionTest({
        initialState,
        action
    })
    .then((result) => t.deepEqual(result.delta, delta, description));
});

test('load song from within the history array', (t) => {

    const description = `
        should set the queue cursor to the loaded track,
        should clear all history ahead of the history cursor,
        should disable the history cursor,
        should add to history
    `;

    const queueCursor = 7;
    const loadedTrackId = baseState.queue[queueCursor];
    const loadedTrack = tracks[loadedTrackId];

    const action = player.load(loadedTrack);

    const historyCursor = 2;
    const history = [0, 1, 2, 3, 4];
    const historyTrackId = history[historyCursor];
    const currentTrack = tracks[historyTrackId];

    const initialState = extend(baseState, {
        player: {
            playStatus: 'play',
            historyCursor,
            history,
            currentTrack
        }
    });

    const delta = {
        queueCursor,
        player: {
            currentTrack: loadedTrack,
            historyCursor: -1,
            history: history.slice(0, historyCursor + 1).concat(loadedTrack._id)
        }
    };

    return actionTest({
        initialState,
        action
    })
    .then((result) => t.deepEqual(result.delta, delta, description));
});
