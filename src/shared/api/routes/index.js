import app from './actions/app';
import library from './actions/library';
import network from './actions/network';
import player from './actions/player';

import handshake from './handshake';
import media from './media';
import rpc from './rpc';
import store from './store';
import track from './track';

const routes = [
    ...app,
    ...library,
    ...network,
    ...player,
    ...handshake,
    ...media,
    ...rpc,
    ...store,
    ...track
];

export default routes;
