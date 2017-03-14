import AppConstants from '../constants/AppConstants';

export default (state = {}, payload) => {
    switch (payload.type) {

        case(AppConstants.APP_NETWORK_PEER_FOUND): {

            const peer = payload.peer;
            const peers = (state.peers || []).slice();

            // if the peers list doesn't include the found peer, add it
            if (peers.every(p => p.id !== peer.id)) {
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
