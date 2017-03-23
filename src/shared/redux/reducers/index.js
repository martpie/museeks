import { combineReducers } from 'redux';

import app from './app';
import config from './config';
import library from './library';
import network from './network';
import player from './player';
import playlists from './playlists';
import queue from './queue';
import toasts from './toasts';
import track from './track';

const reducers = {
    app,
    config,
    library,
    toasts,
    network,
    player,
    playlists,
    queue,
    track
};

export default combineReducers(reducers);
