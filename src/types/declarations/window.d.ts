/// <reference types="vite/client" />

import type { OsType } from '@tauri-apps/plugin-os';

import type { Config, Track } from '../../generated/typings';
import type { PlayerInstance } from '../../lib/player';

declare global {
  /**
   * Tauri's APIs to inspect platform-specific information is asynchronous,
   * which is very inconvenient for small-synchronous utils, so we hack our way
   * around by polluting the global namespace
   */
  interface Window {
    __MUSEEKS_PLATFORM: OsType;
    __MUSEEKS_INITIAL_CONFIG: Config;
    __MUSEEKS_INITIAL_QUEUE: Array<Track> | null;
    __MUSEEKS_PLAYER: PlayerInstance;
    /** Base URL of the local HTTP server for audio streaming when stream_server is enabled */
    __MUSEEKS_STREAM_SERVER_URL?: string;
  }
}
