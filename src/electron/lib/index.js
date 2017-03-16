const lib = require('../../shared/lib');
const actions = require('../redux/actions');

const models = require('../models');

const config = require('./config');
const player = require('./player');
const playlist = require('./playlist')(models.playlist);
const track = require('./track')(models.track);

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
