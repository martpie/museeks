import lib from '../../shared/lib';
import actions from '../redux/actions';
import player from './player';

const library = {
    player,
    playlist: rpc.playlist,
    track: rpc.track
};

// attach shared libraries
const allLibraries = lib(library);

// attach renderer specific actions
library.actions.renderer = actions;

export default allLibraries;
