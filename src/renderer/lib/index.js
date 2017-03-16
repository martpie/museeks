import rpcWrap from '../../shared/modules/rpc'
import lib from '../../shared/lib';
import actions from '../redux/actions';

import rpc from './rpc';
import player from './player';

//
//    track: rpcWrap('track', ['pause', 'play'], 'mainRenderer'),
//    playlist: rpcWrap('playlist', ['pause', 'play'], 'mainRenderer')
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
