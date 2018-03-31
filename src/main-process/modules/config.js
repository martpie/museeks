/**
 * Essential module for creating/loading the app config
 */

const teeny = require('teeny-conf');
const electron = require('electron');
const path = require('path');

const Module = require('./module');

const { app } = electron;


class ConfigManager extends Module {
  constructor(window) {
    super(window);
  }

  load() {
    this.workArea = electron.screen.getPrimaryDisplay().workArea;

    const defaultConfig = this.getDefaultConfig();
    const pathUserData = app.getPath('userData');

    this.conf = new teeny(path.join(pathUserData, 'config.json'));
    this.conf.loadOrCreateSync(defaultConfig);

    // Check if config update
    let configChanged = false;

    for(const key in defaultConfig) {
      if(this.conf.get(key) === undefined) {
        this.conf.set(key, defaultConfig[key]);
        configChanged = true;
      }
    }

    // save config if changed
    if(configChanged) this.conf.saveSync();
  }

  getDefaultConfig() {
    return {
      theme: 'light',
      audioVolume: 1,
      audioPlaybackRate: 1,
      audioMuted: false,
      audioShuffle: false,
      audioRepeat: 'none',
      musicFolders: [],
      sleepBlocker: false,
      autoUpdateChecker: true,
      useNativeFrame: false,
      minimizeToTray: true,
      displayNotifications: true,
      devMode: false,
      bounds: {
        width: 1000,
        height: 600,
        x: parseInt(this.workArea.width / 2),
        y: parseInt(this.workArea.height / 2),
      },
    };
  }

  getConfig() {
    return this.conf.getAll();
  }

  get(key) {
    return this.conf.get(key);
  }

  reload() {
    this.conf.loadOrCreateSync(this.getDefaultConfig());
  }
}

module.exports = ConfigManager;
