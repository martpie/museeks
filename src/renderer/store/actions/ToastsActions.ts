import store from '../store';
import types from '../action-types';
import { ToastType } from '~shared/types/museeks';

/**
 * Add a toast
 */
export const add = (type: ToastType, content: string, duration = 3000): void => {
  const _id = Date.now();
  const toast = { _id, type, content };

  store.dispatch({
    type: types.TOAST_ADD,
    payload: {
      toast,
    },
  });

  window.setTimeout(() => {
    store.dispatch({
      type: types.TOAST_REMOVE,
      payload: {
        toastId: _id,
      },
    });
  }, duration);
};
