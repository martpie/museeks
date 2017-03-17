/*
Demo Route:
[{
    path         : 'api/v1/player/play',    // The api path
    method       : 'GET',                   // Method type
    name         : 'action.player.play',    // Path to the function in the lib
    // Optional
    dispatch     : true,                    // Should the result be dispatched?
    argTransform : function(query) {            // This will transform the query params/body before
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
