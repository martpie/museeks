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
    models : {} // models attached when database initialises
};

const shared = sharedLib(electron);

const library = {
    ...electron,
    ...shared
}

// attach libraries which must be invoked
library.playlist = playlist(library);
library.track = track(library);

export const initLib = (store) => {
    library.store = store;
};

export default library;
