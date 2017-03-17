import { remote } from 'electron';
import { rpcWrap } from '../../shared/modules/rpc';

const remoteAppFunctions = rpcWrap('app', ['restart'], 'electron');

export default {
    ...remoteAppFunctions,
    browserWindows: {
        main : remote.getCurrentWindow()
    },
    version: remote.app.getVersion()
}
