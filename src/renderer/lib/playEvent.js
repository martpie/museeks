import { rpc } from 'electron-simple-rpc';

export default {
    find:    rpc('electron', 'playEvent.find'),
    insert:  rpc('electron', 'playEvent.insert'),
    remove:  rpc('electron', 'playEvent.remove'),
};
