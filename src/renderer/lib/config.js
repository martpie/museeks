import { rpcWrap } from 'electron-simple-rpc';

const functions = [
    'set',
    'delete',
    'save',
    'saveSync',
    'get'
];

export default rpcWrap('config', functions, 'electron');
