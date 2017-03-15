import { remote, app } from 'electron';

export default {
    browserWindows: {
        main: remote.getCurrentWindow()
    },
    version: app.getVersion()
};
