import { nanoid } from 'nanoid';

import { Toast, ToastType } from '../../shared/types/museeks';

import { createStore } from './store-helpers';

type ToastsState = {
  toasts: Toast[];
  add: (type: ToastType, content: string, duration?: number) => void;
  remove: (id: string) => void;
};

const useToastsStore = createStore<ToastsState>((set, get) => ({
  toasts: [],

  add: (type, content, duration = 3000) => {
    const id = nanoid();
    const toast: Toast = { id, type, content };

    set((state) => ({ toasts: [...state.toasts, toast] }));

    window.setTimeout(function removeToast() {
      get().remove(id);
    }, duration);
  },

  remove: (id) => {
    set((state) => ({ toasts: [...state.toasts].filter((t) => t.id !== id) }));
  },
}));

export default useToastsStore;
