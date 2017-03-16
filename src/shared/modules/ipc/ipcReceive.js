let ipcReceive

if (process.type == 'renderer') {
    const { ipcRenderer } = require('electron');

    ipcReceive = (event, callback) => {
        ipcRenderer.on(event, (event, payload) => {
          callback(payload);
        })
    }

} else {
    const { ipcMain } = require('electron');

    ipcReceive = (event, callback) => {
        ipcMain.on(event, (event, payload) => {
          callback(payload);
        })
    }
}

module.exports = ipcReceive;
