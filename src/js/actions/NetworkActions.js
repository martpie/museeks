import store from '../store.js';
import AppConstants from '../constants/AppConstants';

const connect = () => {
    store.dispatch({
        type: AppConstants.APP_NETWORK_CONNECT,
    });
}

const disconnect = () => {
    store.dispatch({
        type: AppConstants.APP_NETWORK_DISCONNECT,
    });
}

const search = () => {
    store.dispatch({
        type: AppConstants.APP_NETWORK_SEARCH,
    });
}

export default {
    connect,
    disconnect,
    search
}