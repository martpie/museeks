import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants  from '../constants/AppConstants';



export default {

    add: function(type, content, duration) {

        duration = duration || 3000;

        let id = Date.now();
        let notification = { _id: id, type: type, content: content };

        AppDispatcher.dispatch({
            actionType   : AppConstants.APP_NOTIFICATION_ADD,
            notification : notification
        });

        setTimeout(() => {
            AppDispatcher.dispatch({
                actionType : AppConstants.APP_NOTIFICATION_REMOVE,
                _id        : id
            });
        }, duration);
    }
}
