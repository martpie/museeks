const handshake = require('./handshake');
const rpc = require('./rpc');

const routes = [
    handshake,
    rpc
];

module.exports = routes;
