import lib from '../../lib';

const add = (notificationData) => {
    if (config.get('displayNotifications')) {
        const notification =
            new Notification(
                notificationData.title,
                {
                    body: notificationData.body,
                    icon: notificationData.icon,
                    silent: true
                }
            );

        notification.onclick = () => {
            lib.app.browserWindows.main.show(),
            lib.app.browserWindows.main.focus()
        };

        return {
            type: 'APP_NOTIFICATION_NEW',
            notification
        };
    }
};

module.exports = {
    add
};
