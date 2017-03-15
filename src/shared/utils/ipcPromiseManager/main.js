const { ipcMain } = require('electron');
const { uniqueId } = require('lodash')
const Promise = require('bluebird');

class IpcPromiseManager {
    constructor(renderer) {
        this.renderer = renderer;
        this.promises = {};

        // Watch for responses
        ipcMain.on('ipcPromise', (event, payload) => {
            // Fetch the promise from the promise store
            const promise = this.promises[payload.promiseId];

            // If we find the promise - we resolve/reject it.
            if (promise) {
                if (payload.status == 'resolve') {
                    promise.resolve(payload.data);
                } else {
                    promise.reject(payload.data);
                }
            }
        });

        // Send: main-process -> renderer
        this.send = (functionToRun, functionInputs) => {

            // Get a unique promise id
            const id = uniqueId('promise_');

            // Create the deferred promise
            const deferred = Promise.pending();

            // Add it to the promise store
            this.promises[id] = deferred;

            // Create the ipc payload
            const payload = {
                promiseId: id,
                data: {
                    functionToRun,
                    functionInputs,
                },
            }

            // Send the ipc event
            this.renderer.webContents.send('ipcPromise', payload);
            return deferred.promise;
        }
    }
}

module.exports = IpcPromiseManager;
