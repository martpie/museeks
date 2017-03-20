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
import playlists from './playlists';
import queue from './queue';
import library from './library';
import settings from './settings';
import store from './store';
import toasts from './toasts';
import notification from './notification';
import handshake from './handshake';
import rpc from './rpc';

const routes = [
    ...app,
    ...player,
    ...playlists,
    ...queue,
    ...library,
    ...settings,
    ...store,
    ...toasts,
    ...notification,
    ...handshake,
    ...rpc
];

export default routes;
