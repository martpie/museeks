import store from '../store';
import types from '../constants/action-types';

import { ToastType } from '../typings/interfaces';

/**
 * Add a toast
 */
export const add = (type: ToastType, content: string, duration = 3000) => {
  const _id = Date.now();
  const toast = { _id, type, content };

  store.dispatch({
    type: types.APP_TOAST_ADD,
    payload: {
      toast
    }
  });

  window.setTimeout(() => {
    store.dispatch({
      type: types.APP_TOAST_REMOVE,
      payload: {
        toastId: _id
      }
    });
  }, duration);
};
