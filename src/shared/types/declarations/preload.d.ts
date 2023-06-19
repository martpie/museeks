// eslint-disable-next-line spaced-comment
/// <reference types="vite/client" />

import type { MuseeksAPI } from '../../../preload/entrypoint.preload';

declare global {
  interface Window {
    MuseeksAPI: MuseeksAPI;
  }

  // Once context bridge is enabled:
  // const MuseeksAPI: MuseeksAPI;
}

export {};
