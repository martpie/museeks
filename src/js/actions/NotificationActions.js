import store from '../store.js';
import AppConstants  from '../constants/AppConstants';

const add = (notification) => {
    new Notification(
        notification.title,
        {
            body: notification.body,
            icon: notification.icon,
            silent: true
        }
    );

    store.dispatch({
        type   : AppConstants.APP_NOTIFICATION_NEW,
        notification
    });
};

export default {
    add
};
