const { rpcWrap } = require('../../shared/modules/rpc');
const playlist = require('../../renderer/lib/playlist').default;

const functions = Object.keys(playlist);

// make playlist functions invoked in electron execute in the renderer via rpc
module.exports = rpcWrap('playlist', functions, 'main-renderer');
