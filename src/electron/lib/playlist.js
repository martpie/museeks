// const playlist = require('../models/playlist');

const find = (data) => playlist.find(data.query).sort(data.sort).execAsync();

const findOne = (data) => playlist.findOneAsync(data.query);

const insert = (data) => playlist.insertAsync(data);

const update = (criteria, data) => playlist.update(criteria, data).execAsync();

const remove = (criteria, options) => playlist.removeAsync(criteria, options);

module.exports = {
    find,
    findOne,
    insert,
    update,
    remove
};
