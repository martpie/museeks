// eslint-disable-next-line spaced-comment
/// <reference types="vite/client" />

import type { ElectronAPI, MuseeksAPI } from '../../../preload/entrypoint';

declare global {
  interface Window {
    MuseeksAPI: MuseeksAPI;
    ElectronAPI: ElectronAPI;
  }

  // Once context bridge is enabled:
  // const MuseeksAPI: MuseeksAPI;
}

export {};
