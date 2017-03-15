const peerFound = (peer) => {
    return {
        type: 'APP_NETWORK_PEER_FOUND',
        peer
    };
}

module.exports = {
    peerFound
}
