const os = require('os');

const routes = [{
    method: 'POST',
    path: '/',
    handler: (req, res) => {
        req.send('network.peerFound', req.payload);
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
