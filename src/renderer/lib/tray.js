import { rpc } from 'electron-simple-rpc';

export default {
    show               : rpc('electron', 'tray.show'),
    hide               : rpc('electron', 'tray.hide'),
    setContextMenu     : rpc('electron', 'tray.setContextMenu'),
    updateTrayMetadata : rpc('electron', 'tray.updateTrayMetadata')
};
