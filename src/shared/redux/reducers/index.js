import { combineReducers } from 'redux';

import app from './app';
import config from './config';
import library from './library';
import network from './network';
import player from './player';
import playlists from './playlists';
import queue from './queue';
import toasts from './toasts';
import tracks from './tracks';

const isolatedReducers = combineReducers({
    app,
    config,
    library,
    network,
    playlists,
    toasts,
    tracks,

    // mock reducers to stop redux complaining about unexpected top level keys
    player: (state = {}) => state,
    queue: (state = {}) => state,
    queueCursor: (state = {}) => state,
    oldQueue: (state = {}) => state,
    system: (state = {}) => state
});

const topLevelReducers = [
    isolatedReducers,
    player,
    queue
];

export default (state, action) => {
    return topLevelReducers.reduce((currentState, reducer) => {
        return reducer(currentState, action);
    }, state);
};
