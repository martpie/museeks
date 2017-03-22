import { rpc } from 'electron-simple-rpc';

export default {
    find:    rpc('electron', 'playlist.find'),
    findOne: rpc('electron', 'playlist.findOne'),
    insert:  rpc('electron', 'playlist.insert'),
    update:  rpc('electron', 'playlist.update'),
    remove:  rpc('electron', 'playlist.remove'),
};
