let appModule;
if (process.type == 'renderer') {
    const { remote } = require('electron');
    appModule = {
        browserWindows: {
            main: remote.getCurrentWindow()
        },
        // version: app.getVersion()
    };
} else {
    const { BrowserWindow, app } = require('electron');
    appModule = {
        browserWindows: {
            main: BrowserWindow.getAllWindows()[0]
        },
        version: app.getVersion()
    };
}

module.exports = appModule;
