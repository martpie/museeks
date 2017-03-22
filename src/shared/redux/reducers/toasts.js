export default (state = {}, payload) => {
    switch (payload.type) {
        case('TOAST/ADD'): {
            const toasts = [...state.toasts, payload.toast];
            return {
                ...state,
                toasts
            };
        }

        case('TOAST/REMOVE'): {
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
