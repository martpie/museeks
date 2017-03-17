const library = (lib) => {

    const peerFound = (peer) => ({
        type: 'APP_NETWORK_PEER_FOUND',
        payload: {
            peer
        }
    });

    return {
        peerFound
    };
}

export default library;
