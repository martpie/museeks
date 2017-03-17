import rpc from './rpc';
import wrap from './rpcWrap';
import RpcIpcManagerClass from './RpcIpcManager';

export default {
    rpc,
    rpcWrap: wrap,
    RpcIpcManager: RpcIpcManagerClass
}

// explicit exports required for webpack
export const rpcWrap = wrap;
export const RpcIpcManager = RpcIpcManagerClass;
