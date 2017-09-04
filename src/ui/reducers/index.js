import app from './app';
import library from './library';
import toasts from './toasts';
import player from './player';
import playlists from './playlists';
import queue from './queue';

const reducers = [
    app,
    library,
    toasts,
    player,
    playlists,
    queue,
];

export default (state, action) => {
    return reducers.reduce((currentState, reducer) => {
        return reducer(currentState, action);
    }, state);
};
