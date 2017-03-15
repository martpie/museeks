import { join } from 'path';
import teeny from 'teeny-conf';

const remote = electron.remote;
const app = remote.app;

const browserWindows = {
    main : remote.getCurrentWindow()
};

const config = new teeny(join(app.getPath('userData'), 'config.json'));
config.loadOrCreateSync();

export default {
    browserWindows,
    config,
    version: app.getVersion()
};
