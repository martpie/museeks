import teeny from 'teeny-conf';
import electron from 'electron';
import path from 'path';

class ConfigManager {

    constructor(app) {
        this.workArea = electron.screen.getPrimaryDisplay().workArea;

        const defaultConfig = this.getDefaultConfig();

        this.conf = new teeny(path.join(app.getPath('userData'), 'config.json'));
        this.conf.loadOrCreateSync(defaultConfig);

        // Check if config update
        let configChanged = false;

        for(const key in defaultConfig) {
            if (this.conf.get(key) === undefined) {
                this.conf.set(key, defaultConfig[key]);
                configChanged = true;
            }
        }

        // save config if changed
        if (configChanged) this.conf.saveSync();
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
                y: parseInt(this.workArea.height / 2)
            }
        };
    }

    getConfig() {
        return this.conf.getAll();
    }
}

export default ConfigManager;
