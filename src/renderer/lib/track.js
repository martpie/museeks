import { rpc } from 'electron-simple-rpc';

export default {
    find:    rpc('electron', 'track.find'),
    findOne: rpc('electron', 'track.findOne'),
    insert:  rpc('electron', 'track.insert'),
    update:  rpc('electron', 'track.update'),
    remove:  rpc('electron', 'track.remove'),
};
