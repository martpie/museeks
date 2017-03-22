import { rpc } from 'electron-simple-rpc';

export default {
    find     : rpc('electron', 'network.find'),
    findOne  : rpc('electron', 'network.findOne'),
    getOwner : rpc('electron', 'network.getOwner'),
    start    : rpc('electron', 'network.start')
};
