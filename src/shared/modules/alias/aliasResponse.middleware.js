const promises = require('./promises');

class aliasResponseMiddleware {
    constructor(scope) {
        this.middleware = store => next => action => {
            if (scope === action.payload.scope) {
                // If this is an aliased function, we run it from the function lib.
                const promise = promises[action.payload.promiseId];
                if (action.type == 'ALIASED_RESOLVE') {
                    promise.resolve(action.payload.result);
                } else if ('ALIASED_REJECT') {
                    promise.reject(action.payload.result);
                }
            }
            return next(action);
        }
    }
}

module.exports = aliasResponseMiddleware;
