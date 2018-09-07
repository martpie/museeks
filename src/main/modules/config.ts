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
  protected conf: typeof teeny;

  constructor () {
    super();

    this.workArea = electron.screen.getPrimaryDisplay().workArea;
  }

  load () {
    const defaultConfig = this.getDefaultConfig();
    const pathUserData = app.getPath('userData');

    this.conf = new teeny(path.join(pathUserData, 'config.json'));
    this.conf.loadOrCreateSync(defaultConfig);

    // Check if config update
    let configChanged = false;

    (Object.keys(defaultConfig) as (keyof Config)[]).forEach((key) => {
      if (this.conf.get(key) === undefined) {
        this.conf.set(key, defaultConfig[key]);
        configChanged = true;
      }
    });

    // save config if changed
    if (configChanged) this.conf.saveSync();
  }

  getDefaultConfig (): Config {
    return {
      theme: 'light',
      audioVolume: 1,
      audioPlaybackRate: 1,
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
      minimizeToTray: true,
      displayNotifications: true,
      bounds: {
        width: 1000,
        height: 600,
        x: Math.round(this.workArea.width / 2),
        y: Math.round(this.workArea.height / 2)
      }
    };
  }

  getConfig () {
    return this.conf.getAll();
  }

  get (key: keyof Config) {
    return this.conf.get(key);
  }

  reload () {
    this.conf.loadOrCreateSync(this.getDefaultConfig());
  }
}

export default ConfigModule;
