/**
 * Essential module for creating/loading the app config
 */

import path from 'path';

import electron from 'electron';
import TeenyConf from 'teeny-conf';

import { Config, Repeat, SortBy, SortOrder } from '../../shared/types/museeks';

import Module from './BaseModule';

const { app } = electron;

export default class ConfigModule extends Module {
  private workArea: Electron.Rectangle;
  private conf: TeenyConf<Config> | undefined;

  constructor() {
    super();

    this.workArea = electron.screen.getPrimaryDisplay().workArea;
  }

  async load(): Promise<void> {
    const defaultConfig: Config = this.getDefaultConfig();
    const pathUserData = app.getPath('userData');

    this.conf = new TeenyConf<Config>(
      path.join(pathUserData, 'config.json'),
      defaultConfig,
    );

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

  getConfig(): TeenyConf<Config> {
    const config = this.conf;

    if (config === undefined) {
      throw new Error('Config is not defined, has it been loaded?');
    }

    return config;
  }

  getDefaultConfig(): Config {
    const config: Config = {
      theme: '__system',
      audioVolume: 1,
      audioPlaybackRate: 1,
      audioOutputDevice: 'default',
      audioMuted: false,
      audioShuffle: false,
      audioRepeat: Repeat.NONE,
      defaultView: 'library',
      librarySort: {
        by: SortBy.ARTIST,
        order: SortOrder.ASC,
      },
      // musicFolders: [],
      sleepBlocker: false,
      autoUpdateChecker: true,
      displayNotifications: true,
      bounds: {
        width: 1000,
        height: 600,
        x: Math.round(this.workArea.width / 2),
        y: Math.round(this.workArea.height / 2),
      },
    };

    return config;
  }

  get config() {
    if (!this.conf) {
      throw new Error('Config not loaded');
    }

    return this.conf;
  }
}
