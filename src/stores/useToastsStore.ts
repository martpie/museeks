import { nanoid } from 'nanoid';

import type { API, Toast, ToastType } from '../types/syncudio';

import { createStore } from './store-helpers';

type ToastsState = API<{
  toasts: Toast[];
  api: {
    add: (type: ToastType, content: string, duration?: number) => void;
    remove: (id: string) => void;
  };
}>;

const useToastsStore = createStore<ToastsState>((set, get) => ({
  toasts: [],

  api: {
    add: (type, content, duration = 5000) => {
      const id = nanoid();
      const toast: Toast = { _id: id, type, content };

      set((state) => ({ toasts: [...state.toasts, toast] }));

      window.setTimeout(function removeToast() {
        get().api.remove(id);
      }, duration);
    },

    remove: (id) => {
      set((state) => ({
        toasts: [...state.toasts].filter((t) => t._id !== id),
      }));
    },
  },
}));

export default useToastsStore;

export function useToastsAPI() {
  return useToastsStore((state) => state.api);
}
