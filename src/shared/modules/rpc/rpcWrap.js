const rpc = require('./rpc');

/****************************************************************
RPC Wrap.

This will create a library of RPC functions.

eg
rpcWrap('track', ['pause', 'play'], 'mainRenderer')
****************************************************************/

const rpcWrap = (namespace, functions, scope) => {
    return functions.reduce((subLib, functionName) => {
        subLib[functionName] = function() {
            return rpc(scope, `${namespace}.${functionName}`, arguments)
        }
        return subLib
    }, {})
}

module.exports = rpcWrap;
