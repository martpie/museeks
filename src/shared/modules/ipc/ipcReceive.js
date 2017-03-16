let ipcReceive

if (process.type == 'browser') {
    const { ipcRenderer } = require('electron');

    ipcReceive = (event, callback) => {
        ipcRenderer.on(event, (event, payload) => {
          callback(payload);
        })
    }

} else {
    const { ipcMain } from 'electron';

    ipcReceive = (event, callback) => {
        ipcMain.on(event, (event, payload) => {
          callback(payload);
        })
    }
}

modules.exports = ipcReceive;
