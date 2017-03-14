const player = require('./Player');
const playlists = require('./Playlists');
const queue = require('./Queue');
const library = require('./Library');
const settings = require('./Settings');
const toasts = require('./Toasts');
const notification = require('./Notification');
const app = require('./App');

const routes = {
    player,
    playlists,
    queue,
    library,
    settings,
    toasts,
    notification,
    app,
};

module.exports = routes;