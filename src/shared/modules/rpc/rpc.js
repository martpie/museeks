const Promise = require('bluebird');
const uuid = require('uuid/v4');
const { BrowserWindow } from 'electron';

const promises = require('./promises');

/****************************************************************
RPC Emit.

This will emit an Remote Procedure Call action (which will travel
to all threads).
Middleware in these other threads will then run the RPC if the
scope is correct.
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
    const eventPayload = {
        promiseId,
        scope,
        functionToRun,
        functionInputs,
    };
    const openWindows = BrowserWindow.getAllWindows();
    openWindows.forEach(({ webContents }) => {
        webContents.send('RPC', );
    });


    return deferred.promise;
}

module.exports = rpc;
