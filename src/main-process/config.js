'use strict';

const teeny    = require('teeny-conf');
const electron = require('electron');
const path     = require('path');

class ConfigManager {

    constructor(app) {
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
            musicFolders: [],
            sleepBlocker: false,
            autoUpdateChecker: true,
            devMode: false,
            bounds: {
                width: 1000,
                height: 600,
                x: parseInt(this.workArea.width / 2),
                y: parseInt(this.workArea.height / 2)
            }
        };
    }

    getConfig() {
        return {
            bounds: this.conf.get('bounds'),
            sleepBlocker: this.conf.get('sleepBlocker')
        };
    }
}

module.exports = ConfigManager;
