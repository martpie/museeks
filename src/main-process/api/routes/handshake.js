const os = require('os');
const extend = require('xtend');

const routes = [{
    method: 'POST',
    path: '/',
    handler: (req, res) => {
        const peer = extend(req.payload, { ip : req.info.remoteAddress });
        req.send('network.peerFound', peer);
        res({
            hostname: os.hostname(),
            platform: os.platform()
        });
    }
}];

module.exports = {
    namespace: 'handshake',
    routes
};
