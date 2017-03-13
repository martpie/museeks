const { ipcRenderer } = require('electron');
const { get } = require('lodash');

class IpcPromiseReceiver {
    constructor(functionLib) {
        ipcRenderer.on('ipcPromise', (event, payload) => {
            const { functionToRun, functionInputs } = payload.data;

            // Create reject/resolve functions
            const resolve = (data) => {
                ipcRenderer.send('ipcPromise', {
                    promiseId: payload.promiseId,
                    status: 'resolve',
                    data
                });

            }
            const reject = (data) => {
                ipcRenderer.send('ipcPromise', {
                    promiseId: payload.promiseId,
                    status: 'reject',
                    data
                });
            }

            // Check the functionLib for the functionToRun
            const actualFunctionToRun = get(functionLib, functionToRun);

            // If we found the function in the functionLib, run it.
            if (actualFunctionToRun) {
                // Run the function and get the result
                const result = Array.isArray(functionInputs) ? actualFunctionToRun(...functionInputs) : actualFunctionToRun(functionInputs);
                // We wrap the result in Promise.resolve so we can treate it like a promise (even if is not a promise);
                Promise.resolve(result).then(resolve).catch(reject)

            } else {
                reject({error: 'Function not found.'});
            }
        })
    }
}

module.exports = IpcPromiseReceiver;
