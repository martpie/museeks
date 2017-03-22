import { rpc } from 'electron-simple-rpc';

export default {
    showItemInFolder: rpc('electron', 'shell.showItemInFolder'),
    openExternal:     rpc('electron', 'shell.openExternal'),
};
