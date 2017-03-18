import { remote } from 'electron';
import { rpcWrap } from 'electron-simple-rpc';

const remoteAppFunctions = rpcWrap('app', ['restart', 'toggleSleepBlocker'], 'electron');

export default {
    ...remoteAppFunctions,
    browserWindows: {
        main : remote.getCurrentWindow()
    },
    version: remote.app.getVersion()
}
