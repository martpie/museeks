import types from '../constants/action-types';

const initialState = [];

export default (state = initialState, payload) => {
  switch (payload.type) {
    case (types.APP_TOAST_ADD): {
      const toasts = [...state, payload.toast];
      return toasts;
    }

    case (types.APP_TOAST_REMOVE): {
      const toasts = [...state].filter(n => n._id !== payload._id);
      return toasts;
    }

    default: {
      return state;
    }
  }
};
