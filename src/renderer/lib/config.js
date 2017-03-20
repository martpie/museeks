import { rpc } from 'electron-simple-rpc';

export default {
    load: rpc('electron', 'config.load'),
    save: rpc('electron', 'config.save'),
};
