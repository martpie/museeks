const { uniqueId } = require('lodash')
const Promise      = require('bluebird');

const promises     = require('./promises');

const emit = (dispatch, functionToRun, functionInputs) => {
    // Get a unique promise id
    const id = uniqueId('promise_');

    // Create the deferred promise
    const deferred = Promise.pending();

    // Add it to the promise store
    promises[id] = deferred;

    // Dispatch the Alias action
    dispatch({
        type: 'ALIASED',
        payload: {
            promiseId: id,
            functionToRun,
            functionInputs,
        }
    });
    return deferred.promise;
}

module.exports = emit;
