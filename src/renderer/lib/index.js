import lib from '../../shared/lib';

import config from './config';
import playlist from './playlist';
import track from './track';

import Player from './player';
const player = new Player(lib);

const library = {
    config,
    player,
    playlist,
    track
};

// attach shared libraries
const allLibraries = lib(library);

export default allLibraries;
