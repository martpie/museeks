import { rpc } from 'electron-simple-rpc';

export default {
    find: rpc('electron', 'network.find'),
    metadata: rpc('electron', 'network.findOne'),
    start: rpc('electron', 'network.start')
};
