const library = (lib) => {

    const find = (data) => lib.models.track.find(data.query).sort(data.sort).execAsync();

    const findOne = (data) => lib.models.track.findOneAsync(data.query);

    const insert = (data) => lib.models.track.insertAsync(data);

    const update = (criteria, data) => lib.models.track.updateAsync(criteria, data);

    const remove = (criteria, options) => lib.models.track.removeAsync(criteria, options);

    return {
        find,
        findOne,
        insert,
        update,
        remove
    };
}

export default library;
