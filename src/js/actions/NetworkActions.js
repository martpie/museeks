import store from '../store.js';
import AppConstants from '../constants/AppConstants';

const peerFound = (peer) => {
    store.dispatch({
        type: AppConstants.APP_NETWORK_PEER_FOUND,
        peer
    });
}

export default {
    peerFound
}
