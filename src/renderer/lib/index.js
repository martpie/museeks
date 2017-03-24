import mutate from 'xtend/mutable';
import sharedLib from '../../shared/lib';

import Player from './player';
import app from './app';
import config from './config';
import playlist from './playlist';
import shell from './shell';
import track from './track';
import tray from './tray';

const player = new Player();

const library = {
    app,
    config,
    player,
    playlist,
    shell,
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
