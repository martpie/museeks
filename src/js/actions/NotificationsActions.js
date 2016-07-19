import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';


export default {

    add: function(type, content, duration = 3000) {

        const _id = Date.now();
        const notification = { _id, type, content };

        AppDispatcher.dispatch({
            actionType   : AppConstants.APP_NOTIFICATION_ADD,
            notification
        });

        setTimeout(() => {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_NOTIFICATION_REMOVE,
                _id
            });
        }, duration);
    }
};
