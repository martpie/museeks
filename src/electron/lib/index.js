import mutate from 'xtend/mutable';
import sharedLib from '../../shared/lib';

import app from './app';
import config from './config';
import player from './player';
import playlist from './playlist';
import track from './track';

const electron = {
    app,
    config,
    player,
    models: {} // models attached when database initialises
};

const library = {
    ...electron
}

// attach libraries which must be invoked
library.playlist = playlist(library);
library.track = track(library);

export const initLib = (store) => {
    library.store = store;

    // attach the shared libraries after the store has been supplied
    const shared = sharedLib(library);

    // attach the shared libraries to our internal library
    mutate(library, shared);
}

export default library;
