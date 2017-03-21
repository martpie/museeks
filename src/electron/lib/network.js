const library = (lib) => {

    const find = (data) => {
        console.trace('network find', data)
        return lib.api.network.find({
            ip: data.peer.ip,
            query : data.query,
            sort : data.sort
        });
    }

    const findOne = (data) => {
        return lib.api.network.findOne({
            ip: data.peer.ip,
            query : data.query,
            sort : data.sort
        })
    }

    const start = (data) => {
        return lib.models.playlist.findAsync(data.query);
    }

    return {
        find,
        findOne,
        start
    };
}

export default library;
