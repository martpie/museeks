import { app } from 'electron';
import path from 'path';

const defaultConfigPath = path.join(app.getPath('userData'), 'config.json');

export default {
    path: defaultConfigPath,
    theme: 'light',
    volume: 1,
    playbackRate: 1,
    muted: false,
    shuffle: false,
    repeat: 'none',
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
    }
}
