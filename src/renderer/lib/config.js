import rpcWrap from '../../shared/modules/rpc';

const functions = [
    'set',
    'delete',
    'save',
    'saveSync',
];

export default rpcWrap('config', functions, 'electron');
