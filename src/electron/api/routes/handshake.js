const os = require('os');
const extend = require('xtend');

const routes = [{
    method: 'POST',
    path: '/',
    handler: (req, res) => {
        const peer = extend(req.payload, { ip : req.info.remoteAddress });
        // req.lib.actions.network.peerFound();
        res({
            hostname: os.hostname(),
            platform: os.platform()
        });
    }
}, {
    method: 'GET',
    path: '/state',
    handler: (req, res) => {
        req.lib.actions.library.load().then((result) => {
            res(result);
            console.log('result', result);
        });
    }
}];

module.exports = {
    namespace: 'handshake',
    routes
};
