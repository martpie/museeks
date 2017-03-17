const Promise = require('bluebird');
const uuid = require('uuid/v4');
const { ipcSend } = require('electron-simple-ipc');
const promises = require('./promises');

/****************************************************************
RPC Emit.

This will emit an Remote Procedure Call action (which will travel
to all threads). This will run a function if scope is correct.
****************************************************************/

const rpc = (scope, functionToRun, functionInputs) => {
    // Get a unique promise id
    const promiseId = `promise_${uuid()}`;

    // Create the deferred promise
    const deferred = Promise.pending();

    // Add it to the promise cache
    // This will be resolved as part of the RPC response middleware
    promises[promiseId] = deferred;

    // Send the event over IPC
    ipcSend('RPC', {
        promiseId,
        scope,
        functionToRun,
        functionInputs,
    });

    return deferred.promise;
}

module.exports = rpc;
