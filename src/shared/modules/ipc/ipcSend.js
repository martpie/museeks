/**************************************************
This function standardises electron's IPC send
so it can be used in either the main electron thread
or a renderer.

The unused section of code should (hopefully?) be
cleaned up in your application's build process.

Example:
ipcSend('SOME_EVENT_NAME', {
  data1: 'some data in the event payload'
})

- David Revay
**************************************************/
let ipcSend

if (process.type == 'renderer') {
    import { ipcRenderer } from 'electron';

    ipcSend = ipcRenderer.send;

} else {
    import { BrowserWindow } from 'electron';

    ipcSend = (event, payload) => {
        const openWindows = BrowserWindow.getAllWindows();
        openWindows.forEach(({ webContents }) => {
            webContents.send(event, payload);
        });
    }
}

export default ipcSend;
