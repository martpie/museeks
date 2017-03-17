import playlist from '../models/playlist';

const find = (data) => playlist.findAsync(data.query);
// const find = (data) => playlist.findAsync(data.query).sort(data.sort);

const findOne = (data) => playlist.findOneAsync(data.query);

const insert = (data) => playlist.insertAsync(data);

const update = (criteria, data) => playlist.updateAsync(criteria, data);

const remove = (criteria, options) => playlist.removeAsync(criteria, options);

export default {
    find,
    findOne,
    insert,
    update,
    remove
};
