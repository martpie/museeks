const actions = require('../shared/redux/actions');
const api = require('../shared/api');
const tracks = require('./tracks');

const lib = {
    actions,
    api,
    models
}

const playlists = require('./playlists')(lib);
const models = require('./models')(lib);

export default lib;
