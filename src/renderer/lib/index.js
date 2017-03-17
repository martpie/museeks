import sharedLib from '../../shared/lib';

import app from './app';
import config from './config';
import playlist from './playlist';
import track from './track';

import Player from './player';
const PlayerInstance = new Player();

const renderer = {
    app,
    config,
    playlist,
    track,
    player: PlayerInstance
};

const shared = sharedLib(renderer);

const lib = {
    ...renderer,
    ...shared
}

// link the player once all libraries are loaded
lib.player.link(lib);

// explicit exports required for webpack
export const actions = lib.actions;
export const player = PlayerInstance;

export default lib;
