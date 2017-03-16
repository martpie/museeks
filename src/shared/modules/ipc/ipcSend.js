let ipcSend

if (process.type == 'browser') {
    const { ipcRenderer } = require('electron');

    ipcSend = (event, payload) => {
        ipcRenderer.send(event, action);
    }

} else {
    const { BrowserWindow } from 'electron';

    ipcSend = (event, payload) => {
        const openWindows = BrowserWindow.getAllWindows();
        openWindows.forEach(({ webContents }) => {
            webContents.send(event, payload);
        });
    }
}

modules.exports = ipcSend;
