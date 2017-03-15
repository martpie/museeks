import AppConstants from '../constants/AppConstants';

const peerFound = (peer) => {
    return {
        type: 'APP_NETWORK_PEER_FOUND',
        peer
    };
}

export default {
    peerFound
}
