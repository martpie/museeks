const player = require('./player');
const playlists = require('./playlists');
const queue = require('./queue');
const library = require('./library');
const settings = require('./settings');
const toasts = require('./toasts');
const notification = require('./notification');
const app = require('./app');

const routes = [
    player,
    playlists,
    queue,
    library,
    settings,
    toasts,
    notification,
    app
];

module.exports = routes;
