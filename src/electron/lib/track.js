const { rpcWrap } = require('../../shared/modules/rpc');
const track = require('../../renderer/lib/track').default;

const functions = Object.keys(track);

// make playlist functions invoked in electron execute in the renderer via rpc
module.exports = rpcWrap('track', functions, 'main-renderer');
