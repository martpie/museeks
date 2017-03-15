module.exports = (track) => {

    const find = (data) => track.find(data.query).sort(data.sort).execAsync();

    const findOne = (data) => track.findOneAsync(data.query);

    const insert = (data) => track.insertAsync(data);

    const update = (criteria, data) => track.update(criteria, data).execAsync();

    const remove = (criteria, options) => track.removeAsync(criteria, options);

    return {
        find,
        findOne,
        insert,
        update,
        remove
    }
}
