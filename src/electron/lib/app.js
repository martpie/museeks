const { BrowserWindow, app } = require('electron');

const restart = () => {
    app.relaunch({ args: process.argv.slice(1) + ['--relaunch'] });
    app.exit(0);
};

export default {
    restart,
    browserWindows: {
        main: BrowserWindow.getAllWindows()[0]
    },
    version: app.getVersion()
}
