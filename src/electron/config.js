import teeny from 'teeny-conf';
import electron from 'electron';
import path from 'path';
import extend from 'xtend';

class ConfigManager {

    constructor(app) {
        this.workArea = electron.screen.getPrimaryDisplay().workArea;

        const defaultConfig = this.getDefaultConfig();

        this.conf = new teeny(path.join(app.getPath('userData'), 'config.json'));
        this.conf.loadOrCreateSync(defaultConfig);

        // merge in the default config, taking existing config as priority
        this.conf.merge(extend(defaultConfig, this.conf.getAll()));

        // save config after merging defaults
        this.conf.saveSync();
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
            },
            electron: {
                api: {
                    port: 54321
                },
                database: {
                    path: undefined // use default database path in prod, override in testing
                }
            },
            renderer: {
                api: {
                    port: 54321
                }
            }
        };
    }

    getConfig() {
        return this.conf.getAll();
    }
}

export default ConfigManager;
