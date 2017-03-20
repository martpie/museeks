export default (state = {}, payload) => {
    switch (payload.type) {

        case('APP_NETWORK_PEER_FOUND'): {

            const newPeer = payload.peer;
            const peers = (state.peers || []).slice();

            // if the peers list doesn't include the found peer, add it
            if (peers.every((peer) => peer.ip !== newPeer.ip)) {
                peers.push(newPeer);
            }

            return {
                ...state,
                peers
            };
        }

        default: {
            return state;
        }
    }
};
