import rpcWrap from '../../shared/modules/rpc';

const functions = [
    'find',
    'findOne',
    'insert',
    'update',
    'remove'
]

export default rpcWrap('playlist', functions, 'electron');
