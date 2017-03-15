import { remote, app } from 'electron';

const browserWindows = {
    main: remote.getCurrentWindow()
};

export default {
    browserWindows,
    version: app.getVersion()
};
