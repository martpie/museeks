const AppConstants = require('../constants/AppConstants');

module.exports = (state = {}, payload) => {
    switch (payload.type) {
        case('APP_TOAST_ADD'): {
            const toasts = [...state.toasts, payload.toast];
            return {
                ...state,
                toasts
            };
        }

        case('APP_TOAST_REMOVE'): {
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
