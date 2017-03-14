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
            target: `${network.address}/24`,
            port: 54321,
            status: 'O',
            timeout: 50,
            concurrency: 10
        });

        lookup.on('result', (result) => {

            const handshake = (peer) => http({
                method: 'GET',
                url: `http://${peer.ip}:54321/api/handshake/`
            })
            .then((response) => response.data)
            .then((peerInfo) => {
                send('network.peerFound', extend(peerInfo, { ip : peer.ip });
            })
            .catch((err) => {
                console.log(err, `Got error ${err.code} when handshaking with ${result.ip}`);
            });

            if (!result.status.includes('ENETUNREACH')) {
                handshake(result);
            }
        });

        lookup.run();
    });
}

class PeerDiscovery {
    constructor(send) {
        // scanning at startup slows application load time
        const scanDelay = 2000;
        setTimeout(() => scanForPeers(send), scanDelay);
    }
}

module.exports = PeerDiscovery;
