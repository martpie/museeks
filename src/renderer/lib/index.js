import mutate from 'xtend/mutable';

import sharedLib from '../../shared/lib';

import app from './app';
import config from './config';
import network from './network';
import playlist from './playlist';
import track from './track';
import tray from './tray';

import Player from './player';
const player = new Player();

const library = {
    app,
    config,
    network,
    player,
    playlist,
    track,
    tray
};

// attach the shared libraries after the store has been supplied
const shared = sharedLib(library);

// at the shared libraries to our internal library
mutate(library, shared);

export const initLib = (store) => {
    library.store = store;

    // init the player once all libraries are loaded
    library.player.init(library);
};

export default library;
