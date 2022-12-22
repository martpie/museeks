import store from '../store';
import types from '../action-types';

/**
 * Show a native notification
 */
export const add = (title: string, notificationData: NotificationOptions): void => {
  if (window.__museeks.config.get('displayNotifications')) {
    const notification = new Notification(title, {
      body: notificationData.body,
      icon: notificationData.icon,
      silent: true,
      tag: 'museeks-notification',
    });

    notification.onclick = () => {
      window.__museeks.browserwindow.show();
      window.__museeks.browserwindow.focus();
    };

    store.dispatch({
      type: types.NOTIFICATION_NEW,
      payload: {
        notification,
      },
    });
  }
};
