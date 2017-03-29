const library = (lib) => {

    const add = (notificationData) => (dispatch, getState) => {
        if (getState.config.displayNotifications) {
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
                lib.app.browserWindows.main.show();
                lib.app.browserWindows.main.focus();
            };

            return {
                type: 'NOTIFICATION/NEW',
                notification
            };
        }
    };

    return {
        add
    };
};

export default library;
