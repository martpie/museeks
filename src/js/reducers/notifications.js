import AppConstants from '../constants/AppConstants';

export default (state = {}, payload) => {
    switch (payload.type) {
        case(AppConstants.APP_NOTIFICATION_ADD): {
            new Notification(
                payload.notification.title,
                {
                    body: payload.notification.body,
                    icon: payload.notification.icon,
                    silent: true
                }
            );

            return state;
        }

        default: {
            return state;
        }
    }
};
