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
}, {
    method: 'GET',
    path: '/state',
    handler: (req, res) => {
        req.send('library.load2', { ip : '192.168.1.2' }).then((result) => {
            res(result);
            console.log('result', result);
        });
    }
}];

module.exports = {
    namespace: 'handshake',
    routes
};
