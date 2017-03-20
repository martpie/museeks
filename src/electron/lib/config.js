import Promise from 'bluebird';
import { app } from 'electron';
import path from 'path';
import mutate from 'xtend/mutable';
const fs = Promise.promisifyAll(require('fs'));

const defaultConfigPath = path.join(app.getPath('userData'), 'config.json');

const defaultConfig = {
    path: defaultConfigPath,
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
    discoverPeers: true,
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

const serializeConfig = () => JSON.stringify(defaultConfig, null, 4);
const deserializeConfig = (data) => JSON.parse(data);

const save = () => fs.writeFileAsync(defaultConfig.path, serializeConfig());

const saveSync = () => fs.writeFileSync(defaultConfig.path, serializeConfig());

const setConfigPath = (path) => defaultConfig.path = path;

const extendConfig = (config) => mutate(defaultConfig, config);

const load = () => {
    return fs.readFileAsync(defaultConfig.path)
    .then(deserializeConfig)
    .then(extendConfig)
    .catch(save);
};

export default {
    load,
    save,
    saveSync,
    setConfigPath,
    extendConfig
};
