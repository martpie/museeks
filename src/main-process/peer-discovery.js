const Promise = require('bluebird');
const flatten = require('flatten');
const evilscan = require('evilscan');
const http = require('axios');
const os = require('os');

class PeerDiscovery {
    constructor(send) {

        const interfaces = flatten(Object.values(os.networkInterfaces()));

        // only scan private ipv4 interfaces - ipv6 networks are likely virtual
        const networks = interfaces.filter(adapter => adapter.family === 'IPv4' && !adapter.internal)

        return Promise.map(networks, (network) => {

            const lookup = new evilscan({
                target : `${network.address}/16`,
                port : 54321,
                status : 'O'
            });

            lookup.on('result', (result) => {
                if (!result.status.includes('ENETUNREACH')) {
                    console.log(result.ip);
                    http({
                        method: 'GET',
                        url: '/api/handshake'
                    })
                    .then((response) => response.data)
                    .then((response) => {
                        console.log('response', response)
                        send('peer-found', result.ip);
                    });
                }
            });

            lookup.run();
        });
    }
}

module.exports = PeerDiscovery;
