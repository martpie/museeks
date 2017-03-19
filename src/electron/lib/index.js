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
    playlist,
    track
};

const shared = sharedLib(electron);

const library = (store) => ({
    store,
    ...electron,
    ...shared
});

export default library;
