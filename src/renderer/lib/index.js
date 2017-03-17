import sharedLib from '../../shared/lib';

import config from './config';
import playlist from './playlist';
import track from './track';

import Player from './player';
const player = new Player();

const library = {
    config,
    player,
    playlist,
    track
};

// attach shared libraries
const allLibraries = sharedLib(library);

// link the player once all libraries are loaded
player.link(allLibraries);

export default allLibraries;
