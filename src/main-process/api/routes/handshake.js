const os = require('os');

const routes = [{
    method : 'GET',
    path: '/',
    handler: (req, res) => {
        res({
            id : os.hostname(),
            name : `${os.platform()} Computer`
        });
    }
}];

module.exports = {
    namespace : 'handshake',
    routes
};
