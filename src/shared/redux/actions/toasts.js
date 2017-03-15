import AppConstants  from '../constants/AppConstants';

const add = (type, content, duration = 3000) => {
    const _id = Date.now();
    const toast = { _id, type, content };

    return (dispatch) => {
        dispatch({
            type   : AppConstants.APP_TOAST_ADD,
            toast
        });
        setTimeout(() => {
            dispatch({
                type : AppConstants.APP_TOAST_REMOVE,
                _id
            });
        }, duration);
    }
};


export default {
    add
};
