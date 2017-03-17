import { rpcWrap } from '../../shared/modules/rpc';

const functions = [
    'find',
    'findOne',
    'insert',
    'update',
    'remove'
];

// make playlist functions invoked in electron execute in the renderer via rpc
export default rpcWrap('playlist', functions, 'main-renderer');
