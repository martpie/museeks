/// <reference types="vite/client" />

import type { OsType } from '@tauri-apps/plugin-os';

import type { Config } from '../../generated/typings';

declare global {
  /**
   * Tauri's APIs to inspect platform-specific information is asynchronous,
   * which is very inconvenient for small-synchronous utils, so we hack our way
   * around by polluting the global namespace
   */
   var __MUSEEKS_PLATFORM: OsType;
   var __MUSEEKS_INITIAL_CONFIG: Config;
}
