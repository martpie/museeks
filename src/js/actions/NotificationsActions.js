import store from '../store.js';
import AppConstants  from '../constants/AppConstants';

const add = (type, content, duration = 3000) => {

    const _id = Date.now();
    const notification = { _id, type, content };

    store.dispatch({
        type   : AppConstants.APP_NOTIFICATION_ADD,
        notification
    });

    setTimeout(() => {
        store.dispatch({
            type : AppConstants.APP_NOTIFICATION_REMOVE,
            _id
        });
    }, duration);
};


export default {
    add
};
