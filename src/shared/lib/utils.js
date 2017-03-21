const library = (lib) => {

    const peerEndpoint = (peer) => {
        const state = lib.store.getState().config;
        const [local, remote] = process.type === 'renderer'
            ? ['renderer', 'electron']
            : ['electron', 'renderer'];

        const protocol = state[local].protocol;
        const host = peer.ip;
        const port = state[remote].protocol;

        return `${protocol}://${host}:${port}`;
    };

    return {
        peerEndpoint
    }
}

export default library;
