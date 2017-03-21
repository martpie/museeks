import app from './actions/app';
import library from './actions/library';
import networkActions from './actions/network';
import player from './actions/player';

import handshake from './handshake';
import network from './network';
import rpc from './rpc';
import store from './store';
import track from './track';

const routes = [
    ...app,
    ...library,
    ...networkActions,
    ...player,

    ...handshake,
    ...network,
    ...rpc,
    ...store,
    ...track
];

export default routes;
