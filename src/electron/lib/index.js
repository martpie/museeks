const sharedLib = require('../../shared/lib');

const app = require('./app');
const config = require('./config');
const player = require('./player');
const playlist = require('./playlist');
const track = require('./track');

const electron = {
    app,
    config,
    player,
    playlist,
    track
};

const shared = sharedLib(electron);

const lib = {
    ...electron,
    ...shared
}

module.exports = lib;
