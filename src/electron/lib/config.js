import teeny from 'teeny-conf';
import path from 'path';
import extend from 'xtend';

const defaultConfig = {
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
        height: 600
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
}

const config = new teeny();

// supply default/static config
config.merge(defaultConfig);

export default config;
