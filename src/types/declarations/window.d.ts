/// <reference types="vite/client" />

import type { OsType } from '@tauri-apps/plugin-os';

import type { Config } from '../../generated/typings';

declare global {
  /**
   * Tauri's APIs to inspect platform-specific information is asynchronous,
   * which is very inconvenient for small-synchronous utils, so we hack our way
   * around by polluting the global namespace
   */
  interface Window {
    __SYNCUDIO_PLATFORM: OsType;
    __SYNCUDIO_INITIAL_CONFIG: Config;
  }
}
