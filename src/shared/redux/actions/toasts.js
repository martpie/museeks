import AppConstants  from '../constants/AppConstants';

const add = (type, content, duration = 3000) => {
    const _id = Date.now();
    const toast = { _id, type, content };

    return (dispatch) => {
        dispatch({
            type   : 'APP_TOAST_ADD',
            toast
        });
        setTimeout(() => {
            dispatch({
                type : 'APP_TOAST_REMOVE',
                _id
            });
        }, duration);
    }
};


export default {
    add
};
