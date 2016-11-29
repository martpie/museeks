import AppConstants from '../constants/AppConstants';

export default (state = {}, payload) => {
    switch (payload.type) {
        case(AppConstants.APP_TOAST_ADD): {
            const toasts = [...state.toasts, payload.toast];
            return {
                ...state,
                toasts
            };
        }

        case(AppConstants.APP_TOAST_REMOVE): {
            const toasts = [...state.toasts].filter((n) => n._id !== payload._id);
            return {
                ...state,
                toasts
            };
        }

        default: {
            return state;
        }
    }
};
