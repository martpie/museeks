const promises = require('./promises');
const { get }  = require('lodash');

class rpcMiddleware {
    /**
     * This middleware is used to receive and respond to rpc actions.
     *
     * @param object lib   - The function library used with rpc
     * @param string scope - This thread's scope (electron, mainRenderer etc)
     */
    constructor(lib, scope) {
        // Check the lib for the functionToRun
        const getFunction = (functionName) => {
            return get(lib, functionName);
        }

        // Create the middleware
        this.middleware = store => next => action => {

            /****************************************************************
            RPC Receive.

            If this is a RPC action and the scope matches. We will run the
            function if we find it in the lib.
            ****************************************************************/
            if (action.type == 'RPC' && scope === action.payload.scope) {
                const { promiseId, functionToRun, functionInputs } = action.payload;

                // Create reject/resolve functions
                const resolve = (result) => {
                    store.dispatch({
                        type: 'RPC_RESOLVED',
                        payload: {
                            promiseId: payload.promiseId,
                            scope,
                            result
                        }
                    })
                }

                const reject = (result) => {
                    store.dispatch({
                        type: 'RPC_REJECTED',
                        payload: {
                            promiseId: payload.promiseId,
                            scope,
                            result
                        }
                    });
                }

                const functionFromAlias = getFunction(functionToRun);
                // If we have a function, run it.
                if (functionFromAlias){
                    // Run the function and get the result
                    const result = functionFromAlias.apply(null, functionInputs);
                    // We wrap the result in Promise.resolve so we can treat
                    // it like a promise (even if is not a promise);
                    Promise.resolve(result).then(resolve).catch(reject);
                }
                else {
                    reject({error: 'Function not found.'})
                }
                return next(action);
            }

            /****************************************************************
            RPC Response.

            When we see RPC_RESOLVED or RPC_REJECTED events we must check
            to see if there is a corresponding RPC promise in the promise
            cache. If we find one, we resolve the promise.
            ****************************************************************/
            if (scope === action.payload.scope) {
                // Check the promise cache
                const promise = promises[action.payload.promiseId];
                if (promise) {
                    // Resolve/reject the promise
                    if (action.type == 'RPC_RESOLVED') {
                        promise.resolve(action.payload.result);
                    } else if (action.type == 'RPC_REJECTED') {
                        promise.reject(action.payload.result);
                    }
                }
            }
            return next(action);
        }
    }
}

module.exports = rpcMiddleware;
