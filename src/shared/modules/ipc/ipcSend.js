let ipcSend

if (process.type == 'renderer') {
    const { ipcRenderer } = require('electron');

    ipcSend = (event, payload) => {
        ipcRenderer.send(event, action);
    }

} else {
    const { BrowserWindow } = require('electron');

    ipcSend = (event, payload) => {
        const openWindows = BrowserWindow.getAllWindows();
        openWindows.forEach(({ webContents }) => {
            webContents.send(event, payload);
        });
    }
}

module.exports = ipcSend;
