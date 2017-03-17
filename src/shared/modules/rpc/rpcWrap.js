import rpc from './rpc';

/****************************************************************
RPC Wrap.

This will create a library of RPC functions.

eg:
rpcWrap('track', ['pause', 'play'], 'main-renderer')
****************************************************************/

const rpcWrap = (namespace, functions, scope) => {
    return functions.reduce((rpcLib, functionName) => {
        rpcLib[functionName] = function() {
            return rpc(scope, `${namespace}.${functionName}`, arguments)
        }
        return rpcLib
    }, {})
}

module.exports = rpcWrap;
