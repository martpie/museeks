import { rpc } from 'electron-simple-rpc';

export default {
    scan: rpc('electron', 'peerDiscovery.scan'),
};
