import { rpc } from 'electron-simple-rpc';

export default {
    set      : rpc('electron', 'config.set'),
    delete   : rpc('electron', 'config.delete'),
    save     : rpc('electron', 'config.save'),
    saveSync : rpc('electron', 'config.saveSync'),
    get      : rpc('electron', 'config.get'),
};

