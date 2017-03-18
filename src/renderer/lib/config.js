import { rpcWrap } from 'electron-simple-rpc';

const functions = [
    'set',
    'delete',
    'save',
    'saveSync',
];

export default rpcWrap('config', functions, 'electron');
