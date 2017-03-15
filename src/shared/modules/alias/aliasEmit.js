const Promise = require('bluebird');
const uuid = require('uuid/v4');

const promises = require('./promises');

const emit = (dispatch, functionToRun, functionInputs, scope) => {
    // Get a unique promise id
    const id = `promise_${uuid()}`;

    // Create the deferred promise
    const deferred = Promise.pending();

    // Add it to the promise store
    promises[id] = deferred;

    // Dispatch the Alias action
    dispatch({
        type: 'ALIASED',
        payload: {
            promiseId: id,
            scope,
            functionToRun,
            functionInputs,
        }
    });
    return deferred.promise;
}

module.exports = emit;
