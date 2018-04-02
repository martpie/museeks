import store from '../store.js';
import types  from '../constants/action-types';
import * as app from '../lib/app';

const add = (notificationData) => {
  if (app.config.get('displayNotifications')) {
    const notification =
      new Notification(
        notificationData.title,
        {
          body: notificationData.body,
          icon: notificationData.icon,
          silent: true,
          tag: 'museeks-notification',
        }
      );

    notification.onclick = () => {
      app.browserWindows.main.show();
      app.browserWindows.main.focus();
    };

    store.dispatch({
      type   : types.APP_NOTIFICATION_NEW,
      notification,
    });
  }
};

export default {
  add,
};
