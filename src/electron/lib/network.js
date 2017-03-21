const library = (lib) => {

    const find = (data) => {
        return lib.api.track.find({
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
        start
    };
}

export default library;
