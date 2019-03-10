/**
 * Essential module for creating/loading the app config
 */

import * as electron from 'electron';
import * as path from 'path';
import teeny from 'teeny-conf';

import Module from './module';
import { Config, Repeat, SortBy, SortOrder } from '../../shared/types/interfaces';

const { app } = electron;

class ConfigModule extends Module {
  protected workArea: Electron.Rectangle;
  protected conf: teeny | undefined;

  constructor () {
    super();

    this.workArea = electron.screen.getPrimaryDisplay().workArea;
  }

  async load () {
    const defaultConfig: Record<string, any> = this.getDefaultConfig();
    const pathUserData = app.getPath('userData');

    this.conf = new teeny(path.join(pathUserData, 'config.json'), defaultConfig);

    // Check if config update
    let configChanged = false;

    (Object.keys(defaultConfig) as (keyof Config)[]).forEach((key) => {
      if (this.conf && this.conf.get(key) === undefined) {
        this.conf.set(key, defaultConfig[key]);
        configChanged = true;
      }
    });

    // save config if changed
    if (configChanged) this.conf.save();
  }

  getDefaultConfig (): Config {
    const config: Config = {
      theme: 'light',
      audioVolume: 1,
      audioPlaybackRate: 1,
      audioOutputDevice: 'default',
      audioMuted: false,
      audioShuffle: false,
      audioRepeat: Repeat.NONE,
      librarySort: {
        by: SortBy.ARTIST,
        order: SortOrder.ASC
      },
      // musicFolders: [],
      sleepBlocker: false,
      autoUpdateChecker: true,
      minimizeToTray: false,
      displayNotifications: true,
      bounds: {
        width: 1000,
        height: 600,
        x: Math.round(this.workArea.width / 2),
        y: Math.round(this.workArea.height / 2)
      }
    };

    return config;
  }

  getConfig (): Config {
    if (!this.conf) {
      throw (new Error('Config not loaded'));
    }

    return this.conf.get() as Config; // Maybe possible to type TeenyConf with Generics?
  }

  get (key: keyof Config) {
    if (!this.conf) {
      throw (new Error('Config not loaded'));
    }

    return this.conf.get(key);
  }

  reload () {
    if (!this.conf) {
      throw (new Error('Config not loaded'));
    }

    this.conf.reload();
  }
}

export default ConfigModule;
