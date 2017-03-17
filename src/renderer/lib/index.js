import sharedLib from '../../shared/lib';

import app from './app';
import config from './config';
import playlist from './playlist';
import track from './track';

import Player from './player';
const player = new Player();

const renderer = {
    app,
    config,
    player,
    playlist,
    track
};

const shared = sharedLib(renderer);

const lib = {
    ...renderer,
    ...shared
}

// link the player once all libraries are loaded
lib.player.link(lib);

export default lib;
