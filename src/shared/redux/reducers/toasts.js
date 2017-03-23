export default (state = {}, payload) => {
    switch (payload.type) {
        case('TOAST/ADD'): {
            const toasts = [...state, payload.toast];
            return toasts;
        }

        case('TOAST/REMOVE'): {
            const toasts = [...state].filter((n) => n._id !== payload._id);
            return toasts;
        }

        default: {
            return state;
        }
    }
};
