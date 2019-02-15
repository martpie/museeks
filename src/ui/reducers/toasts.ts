import types from '../constants/action-types';

import { Toast, Action } from '../../shared/types/interfaces';

export type ToastsState = Toast[];

const initialState: ToastsState = [];

export default (state = initialState, action: Action): ToastsState => {
  switch (action.type) {
    case (types.TOAST_ADD): {
      const toasts = [...state, action.payload.toast];
      return toasts;
    }

    case (types.TOAST_REMOVE): {
      const toasts = [...state].filter(n => n._id !== action.payload.toastId);
      return toasts;
    }

    default: {
      return state;
    }
  }
};
