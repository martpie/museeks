const library = (lib) => {

    const peerEndpoint = (peer) => {
//        const { config } = lib.store.getState();
        const [local, remote] = process.type === 'renderer'
            ? ['renderer', 'electron']
            : ['electron', 'renderer'];

//        const protocol = config[local].api.protocol;
        const protocol = 'http';
        const host = peer.ip;
//        const port = config[remote].api.port;
        const port = '54321';

        return `${protocol}://${host}:${port}`;
    };

    return {
        peerEndpoint
    }
}

export default library;
