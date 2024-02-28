// eslint-disable-next-line spaced-comment
/// <reference types="vite/client" />

import { OsType } from '@tauri-apps/plugin-os';

declare global {
  /**
   * Tauri's APIs to inspect platform-specific information is asynchronous,
   * which is very inconvenient for small-synchronous utils, so we hack our way
   * around by polluting the global namespace
   */
  interface Window {
    __museeks_osType: OsType;
  }
}

export {};
