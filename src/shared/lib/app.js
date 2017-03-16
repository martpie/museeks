const { remote, app } = require('electron');

module.exports = {
    browserWindows: {
        main: remote.getCurrentWindow()
    },
    version: app.getVersion()
};
