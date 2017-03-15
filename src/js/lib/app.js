import path from 'path';
import teeny from 'teeny-conf';

const remote = electron.remote;
const app = remote.app;

const browserWindows = {};
browserWindows.main = remote.getCurrentWindow();

const pathUserData = app.getPath('userData');

const config = new teeny(path.join(pathUserData, 'config.json'));
config.loadOrCreateSync();

export default {
    browserWindows,
    config,
    version: app.getVersion(),
};
