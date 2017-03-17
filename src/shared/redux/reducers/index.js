import app from './app';
import config from './config';
import library from './library';
import toasts from './toasts';
import player from './player';
import playlists from './playlists';
import network from './network';
import queue from './queue';

const reducers = [
    app,
    config,
    library,
    toasts,
    player,
    playlists,
    network,
    queue
];

module.exports = (state, action) => {
    return reducers.reduce((currentState, reducer) => {
        return reducer(currentState, action);
    }, state);
};
