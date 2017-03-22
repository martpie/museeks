import { rpc } from 'electron-simple-rpc';

export default {
    find:    rpc('electron', 'tray.show'),
    findOne: rpc('electron', 'tray.hide'),
    insert:  rpc('electron', 'tray.setContextMenu'),
};
