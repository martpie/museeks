/*
Demo Route:
[{
    path         : 'api/v1/player/play',    // The api path
    method       : 'GET',                   // Method type
    name         : 'action.player.play',    // Path to the function in the lib
    // Optional
    dispatch     : true,                    // Should the result be dispatched?
    argTransform : (query) => ({            // This will transform the query params/body before
        songName: query.name,               // it is passed to the aliased function.
    }),
}]
*/


const player = require('./player');
const playlists = require('./playlists');
const queue = require('./queue');
const library = require('./library');
const settings = require('./settings');
const toasts = require('./toasts');
const notification = require('./notification');
const app = require('./app');

const routes = [
    ...player,
    ...playlists,
    ...queue,
    ...library,
    ...settings,
    ...toasts,
    ...notification,
    ...app
];

module.exports = routes;
