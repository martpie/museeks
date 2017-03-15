const peerFound = (peer) => ({
    type: 'APP_NETWORK_PEER_FOUND',
    payload: {
        peer
    }
})

module.exports = {
    peerFound
}
