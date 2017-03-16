import lib from '../../shared/lib';
import actions from '../redux/actions';
import player from './player';
import playlist from './playlist''
import track from './playlist''

const library = {
    player,
    playlist,
    track,
};

// attach shared libraries
const allLibraries = lib(library);

// attach renderer specific actions
library.actions.renderer = actions;

export default allLibraries;
