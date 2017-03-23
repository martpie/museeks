const library = (lib) => {

    const peerEndpoint = (peer) => {
//        const { config } = lib.store.getState();
//        const protocol = config[local].api.protocol;
//        const port = config[remote].api.port;

        const [local, remote] = process.type === 'renderer'
            ? ['renderer', 'electron']
            : ['electron', 'renderer'];

        const protocol = 'http';
        const host = peer.isLocal ? 'localhost' : peer.ip;
        const port = '54321';

        return `${protocol}://${host}:${port}`;
    };

    const peerIsMe = (peer) => {
        const { network : { me } } = lib.store.getState();
        return peer.hostname === me.hostname;
    }

    return {
        peerEndpoint,
        peerIsMe
    }
}

export default library;
