import { invoke } from '@tauri-apps/api/core';

import type { Config } from '../generated/typings';

import { logAndNotifyError } from './utils';

/**
 * Config Bridge for the UI to communicate with the backend
 */
class ConfigManager {
  initialConfig: Config | null = null;

  async init() {
    if (this.initialConfig != null) {
      throw new Error('Config is already instantiated');
    }

    this.initialConfig = await this.getAll();
  }

  /**
   * Get the initial value of the config at the time of instantiation.
   * Should only be used when starting the app.
   */
  getInitial<T extends keyof Config>(key: T): Config[T] {
    if (this.initialConfig == null) {
      throw new Error('Config has not been instantiated with initial values');
    }

    return this.initialConfig[key];
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
