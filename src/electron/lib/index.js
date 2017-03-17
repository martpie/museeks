const sharedLib = require('../../shared/lib');

const config = require('./config');
const player = require('./player');
const playlist = require('./playlist');
const track = require('./track');

const library = {
    config,
    player,
    playlist,
    track
};

// attach shared libraries
const allLibraries = sharedLib(library);

module.exports = allLibraries;
