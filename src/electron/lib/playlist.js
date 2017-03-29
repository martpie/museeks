const library = (lib) => {

    const find = (data) => lib.models.playlist.findAsync(data.query);

    const findOne = (data) => lib.models.playlist.findOneAsync(data.query);

    const insert = (data) => lib.models.playlist.insertAsync(data);

    const update = (criteria, data) => lib.models.playlist.updateAsync(criteria, data);

    const remove = (criteria, options = {}) => lib.models.playlist.removeAsync(criteria, options);

    return {
        find,
        findOne,
        insert,
        update,
        remove
    };
};

export default library;
