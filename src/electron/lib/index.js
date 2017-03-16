const lib = require('../../shared/lib');
const actions = require('../redux/actions');

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
const allLibraries = lib(library);

// attach electron specific actions
library.actions.electron = actions;

module.exports = allLibraries;
