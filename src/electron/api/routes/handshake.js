const os = require('os');
const extend = require('xtend');

module.exports = [{
    method: 'POST',
    path: 'api/v1/handshake',
    handler: (req, res) => {
        const peer = extend(req.payload, { ip : req.info.remoteAddress });
        // req.lib.actions.network.peerFound();
        res({
            hostname: os.hostname(),
            platform: os.platform()
        });
    }
}];
