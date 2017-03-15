const { get } = require('lodash');

class aliasReceive {
    constructor(library) {

        // Check the functionLib for the functionToRun
        const getFunction = (functionName) => {
            return get(library, functionName);
        }

        // Run a function
        const run = (fn, args) => {
            // handle different argument formats
            if (Array.isArray(args)) {
                return fn(...args);
            } else if (args === null) {
                return fn({});
            } else {
                return fn(args);
            }
        }

        this.middleware = store => next => action => {
            // If this is an aliased function, we run it from the function lib.
            if(action.type == 'ALIASED') {
                const { promiseId, functionToRun, functionInputs } = action.payload;

                // Create reject/resolve functions
                const resolve = (result) => {
                    store.dispatch({
                        type: 'ALIASED_RESOLVE',
                        payload: {
                            promiseId: payload.promiseId,
                            result
                        }
                    })
                }

                const reject = (result) => {
                    store.dispatch({
                        type: 'ALIASED_REJECT',
                        payload: {
                            promiseId: payload.promiseId,
                            result
                        }
                    });
                }

                const functionFromAlias = getFunction(functionToRun);
                // If we have a function, run it.
                if(functionFromAlias){
                    // Run the function and get the result
                    const result = run(functionFromAlias, functionInputs);
                    // We wrap the result in Promise.resolve so we can treate it like a promise (even if is not a promise);
                    Promise.resolve(result).then(resolve).catch(reject);
                }
                else {
                    reject({error: 'Function not found.'})
                }
                return next(action);
            }
            return next(action);
        }
    }
}

module.exports = aliasReceive;
