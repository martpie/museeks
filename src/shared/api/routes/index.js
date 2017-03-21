/*
Demo Route:
[{
    path: 'api/v1/player/play',    // The api path
    method: 'GET',                   // Method type
    name: 'action.player.play',    // Path to the function in the lib
    // Optional
    dispatch: true,                    // Should the result be dispatched?
    argTransform: unction(query) {            // This will transform the query params/body before
        if (someCase) {
            return {
                songName: query.song
            }
        } else {
            arguments[0] = query.key,
            arguments[1] = query.value,
            return arguments
        }
    },
}]
*/


import app from './actions/app';
import library from './actions/library';
import network from './actions/network';
import player from './actions/player';

import handshake from './handshake';
import rpc from './rpc';
import store from './store';
import track from './track';

const routes = [
    ...app,
    ...library,
    ...network,
    ...player,
    ...handshake,
    ...rpc,
    ...store,
    ...track
];

export default routes;
