const library = (lib) => {

    const add = (notificationData) => (dispatch, getState) => {
        if (getState.config.displayNotifications) {
            const contents = {
                body: notificationData.body,
                icon: notificationData.icon,
                silent: true
            };

            const notification = new Notification(notificationData.title, contents);

            notification.onclick = () => {
                lib.app.browserWindows.main.show();
                lib.app.browserWindows.main.focus();
            };

            dispatch({
                type: 'NOTIFICATION/NEW',
                payload: {
                    notification
                }
            });
        }
    };

    return {
        add
    };
};

export default library;
