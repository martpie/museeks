const { remote } = require('electron');
const { rpcWrap } = require('../../shared/modules/rpc');

const main = remote.getCurrentWindow();

export default {
    restart: rpcWrap('app', ['restart'], 'electron'),
    browserWindows: {
        main
    },
    version: remote.app.getVersion()
}
