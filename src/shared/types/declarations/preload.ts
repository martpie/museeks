// eslint-disable-next-line spaced-comment
/// <reference types="vite/client" />

import { MuseeksAPI } from '../../../preload/entrypoint';

declare global {
  interface Window {
    __museeks: MuseeksAPI;
  }
}

export {};
