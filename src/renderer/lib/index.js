import lib from '../../shared/lib';
import actions from '../redux/actions';

import playlist from './playlist';
import track from './track';

import Player from './player';
const player = new Player(lib);

const library = {
    player,
    playlist,
    track
};

// attach shared libraries
const allLibraries = lib(library);

// attach renderer specific actions
library.actions.renderer = actions;

export default allLibraries;
