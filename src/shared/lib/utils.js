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

    const trackEndpoint = ({ _id, peer }) => `${peerEndpoint(peer)}/api/track/download?_id=${_id}`;

    const coverEndpoint = ({ _id, peer }) => `${peerEndpoint(peer)}/api/track/cover?_id=${_id}`;

    const dispatchEndpoint = ({ peer }) => `${peerEndpoint(peer)}/api/store/dispatch`;

    return {
        peerEndpoint,
        peerIsMe,
        trackEndpoint,
        coverEndpoint,
        dispatchEndpoint
    }
}

export default library;
