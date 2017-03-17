const { remote } = require('electron');
import { rpcWrap } = require('../../shared/modules/rpc');

const main = remote.getCurrentWindow();

export default {
    restart: rpcWrap('app', ['restart'], 'electron'),
    browserWindows: {
        main
    },
    version: app.getVersion()
}
