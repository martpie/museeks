import { rpcWrap } from 'electron-simple-rpc';

const functions = [
    'find',
    'findOne',
    'insert',
    'update',
    'remove'
];

// make playlist functions invoked in the renderer execute in electron via rpc
export default rpcWrap('playlist', functions, 'electron');
