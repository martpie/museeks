import { rpc } from 'electron-simple-rpc';

export default {
    find: rpc('electron', 'network.find'),
    start: rpc('electron', 'network.start')
};
