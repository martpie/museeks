const lib = require('../../shared/lib');
const actions = require('../redux/actions');

const models = require('../models');
const playlist = require('./playlist')(models.playlist);
const track = require('./track')(models.track);

const player = require('./player');

const library = {
    player,
    playlist,
    track
};

// attach shared libraries
const allLibraries = lib(library);

// attach electron specific actions
library.actions.electron = actions;

module.exports = allLibraries;
