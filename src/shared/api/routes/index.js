import app from './actions/app';
import library from './actions/library';
import networkActions from './actions/network';
import player from './actions/player';
import trackActions from './actions/tracks';

import handshake from './handshake';
import rpc from './rpc';
import store from './store';
import tracks from './tracks';

const routes = [
    ...app,
    ...library,
    ...networkActions,
    ...player,
    ...trackActions,

    ...handshake,
    ...rpc,
    ...store,
    ...tracks
];

export default routes;
