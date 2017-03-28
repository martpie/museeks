const library = (lib) => {

    const find = (data) => lib.models.playEvent.findAsync(data.query);

    const insert = (data) => lib.models.playEvent.insertAsync(data);

    const remove = (criteria, options) => lib.models.playEvent.removeAsync(criteria, options);

    return {
        find,
        insert,
        remove
    };
}

export default library;
