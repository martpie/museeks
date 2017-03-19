import mutate from 'xtend/mutable';

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
    playlist,
    track,
    player
};

const library = {
    ...renderer
}

// attach the shared libraries after the store has been supplied
const shared = sharedLib(library);

// at the shared libraries to our internal library
mutate(library, shared);

export const initLib = (store) => {
    library.store = store;

    // link the player once all libraries are loaded
    library.player.link(library);
};

export default library;
