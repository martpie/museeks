/**************************************************
This function standardises electron's IPC receive
so it can be used in either the main electron thread
or a renderer.

The unused section of code should (hopefully?) be
cleaned up in your application's build process.

Example:
ipcReceive('SOME_EVENT_NAME', (payload) => {
  console.log('We process the payload here', payload);
})


- David Revay
**************************************************/
let ipcReceive

if (process.type == 'renderer') {
    import { ipcRenderer } from 'electron';

    ipcReceive = (event, callback) => {
        ipcRenderer.on(event, (event, payload) => {
          callback(payload);
        })
    }

} else {
    import { ipcMain } from 'electron';

    ipcReceive = (event, callback) => {
        ipcMain.on(event, (event, payload) => {
          callback(payload);
        })
    }
}

module.exports = ipcReceive;
