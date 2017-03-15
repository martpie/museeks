const linvodb = require('linvodb3');
const leveljs = require('level-js');
const Promise = require('bluebird');

const track = require('./models/track');
const playlist = require('./models/playlist');

module.exports = (app) => {
    linvodb.defaults.store = { db: leveljs };
    linvodb.dbPath = app.getPath('userData');

    return {
        track,
        playlist
    }
}
