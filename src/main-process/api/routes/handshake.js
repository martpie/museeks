const os = require('os');

const routes = [{
    method: 'GET',
    path: '/',
    handler: (req, res) => {
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
