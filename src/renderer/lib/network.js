import rpc from '../../shared/utils/rpc';

// execute calls to network in the electron thread
const rpcElectron = rpc.wrap('electron', 'network');

const functions = {
    find: rpcElectron,
    findOne: rpcElectron,
    getOwner: rpcElectron,
    start: rpcElectron
};

const library = rpc.translate(functions);

export default library;
