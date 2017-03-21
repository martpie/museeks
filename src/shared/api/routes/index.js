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


import app from './app';
import player from './player';
import library from './library';
import network from './network';
import store from './store';
import handshake from './handshake';
import rpc from './rpc';

const routes = [
    ...app,
    ...player,
    ...library,
    ...network,
    ...store,
    ...handshake,
    ...rpc
];

export default routes;
