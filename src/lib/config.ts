import { invoke } from '@tauri-apps/api/core';

import type { Config } from '../generated/typings';

import { logAndNotifyError } from './utils';

/**
 * Config Bridge for the UI to communicate with the backend
 */
class ConfigManager {
  initialConfig: Config | null = null;

  /**
   * Get the initial value of the config at the time of instantiation.
   * Should only be used when starting the app.
   */
  getInitial<T extends keyof Config>(key: T): Config[T] {
    if (window.__SYNCUDIO_INITIAL_CONFIG === undefined) {
      throw new Error('Config has not been injected from the back-end');
    }

    return window.__SYNCUDIO_INITIAL_CONFIG[key];
  }

  async getAll(): Promise<Config> {
    // TODO: check data shape?
    return invoke('plugin:config|get_config');
  }

  async get<T extends keyof Config>(key: T): Promise<Config[T]> {
    const config = await this.getAll();
    return config[key];
  }

  async set<T extends keyof Config>(key: T, value: Config[T]): Promise<void> {
    const config = await this.getAll();
    config[key] = value;

    try {
      invoke('plugin:config|set_config', { config });
    } catch (err) {
      logAndNotifyError(err);
    }

    return;
  }
}

export default new ConfigManager();
