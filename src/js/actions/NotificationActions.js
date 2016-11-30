import store from '../store.js';
import AppConstants  from '../constants/AppConstants';

const add = (notification) => {
    store.dispatch({
        type   : AppConstants.APP_NOTIFICATION_ADD,
        notification
    });
};


export default {
    add
};
