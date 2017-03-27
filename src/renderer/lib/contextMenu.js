import { rpc } from 'electron-simple-rpc';

export default {
    trackList: rpc('electron', 'contextMenu.trackList'),
};
