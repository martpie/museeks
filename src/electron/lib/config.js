import { app } from 'electron';
import path from 'path';
import Promise from 'bluebird';
const fs = Promise.promisifyAll(require('fs'));

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

// static config defaults to user's home directory
const defaultPath = path.join(app.getPath('userData'), 'config.json');

const save = (data) => {
  const output = JSON.stringify(data, null, 4);
  return fs.writeFileAsync(defaultPath, output);
}


const load = () => {
  return fs.readFileAsync(defaultPath).then((stringData) => {
      // Check if json is valid
      try {
          const data = JSON.parse(stringData);
          return Object.assign({}, defaultConfig, data);
      }
      catch(err) {
          // Json is corrupt, overwrite settings with default
          return save(defaultConfig);
      }
  })
}


export default {
  load,
  save
};
