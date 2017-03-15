const AppConstants = require('../constants/AppConstants');

module.exports = (state = {}, payload) => {
    switch (payload.type) {

        case('APP_NETWORK_PEER_FOUND'): {

            const peer = payload.peer;
            const peers = (state.peers || []).slice();

            // if the peers list doesn't include the found peer, add it
            if (peers.every(p => p.ip !== peer.ip)) {
                peers.push(peer);
            }
console.log('peers', peers)
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
