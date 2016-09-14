import AppConstants from '../constants/AppConstants';

export default (state = {}, payload) => {
    switch (payload.type) {
        case(AppConstants.APP_NOTIFICATION_ADD): {
            const notifications = [...state.notifications, payload.notification];
            return {
                ...state,
                notifications
            };
        }

        case(AppConstants.APP_NOTIFICATION_REMOVE): {
            const notifications = [...state.notifications].filter((n) => n._id !== payload._id);
            return {
                ...state,
                notifications
            };
        }

        default: {
            return state;
        }
    }
};
