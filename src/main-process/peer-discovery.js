const Promise = require('bluebird');
const flatten = require('flatten');
const evilscan = require('evilscan');
const http = require('axios');
const os = require('os');

const scanForPeers = (send) => {

    const interfaces = flatten(Object.values(os.networkInterfaces()));

    // only scan for external ipv4 adapters
    const networks = interfaces.filter(adapter => adapter.family === 'IPv4' && !adapter.internal);

    networks.forEach((network) => {

        const lookup = new evilscan({
            target: `${network.address}/16`,
            port: 54321,
            status: 'O',
            timeout: 50
        });

        lookup.on('result', (result) => {
            if (!result.status.includes('ENETUNREACH')) {
                http({
                    method: 'GET',
                    url: '/api/handshake/'
                })
                .then((response) => response.data)
                .then((response) => {
                    console.log('peer handshake response', response);
                    send('peer-found', result.ip);
                })
                .catch((err) => {
                    console.warn(`Got error ${err.code} when handshaking with ${result.ip}`);
                });
            }
        });

        lookup.run();
    });
}

class PeerDiscovery {
    constructor(send) {
        // scanning at startup slows application load time
        const scanDelay = 5000;
        setTimeout(scanForPeers(send), scanDelay);
    }
}

module.exports = PeerDiscovery;
