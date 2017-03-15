const actions = require('../shared/redux/actions');
const api = require('../shared/api');

const models = require('../models');
const playlist = require('./playlist')(models.playlist);
const track = require('./track')(models.track);

export default {
    actions,
    api,
    models,
    playlist,
    track
};
