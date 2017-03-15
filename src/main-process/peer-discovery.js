const Promise = require('bluebird');
const flatten = require('flatten');
const scan = require('evilscan');
const http = require('axios');
const extend = require('xtend');
const os = require('os');

class PeerDiscovery {
    constructor(send) {
        this.send = send;

        // scanning at startup slows application load time
        const scanDelay = 2000;
        setTimeout(() => this.scanForPeers, scanDelay);
    }
    handshake (network, peer) {
        return http({
            method: 'POST',
            url: `http://${peer.ip}:54321/api/handshake/`,
            data: {
                hostname: os.hostname(),
                platform: os.platform(),
                ip: network.address
            }
        })
        .then((response) => response.data)
        .then((peerInfo) => {
            this.send('network.peerFound', extend(peerInfo, { ip : peer.ip }));
        })
        .catch((err) => {
            const ignore = err.response.status === 404;

            if (!ignore) {
                console.log(err, `Got error ${err.code} when handshaking with ${peer.ip}`);
            }
        });
    }
    scanForPeers() {

        const interfaces = flatten(Object.values(os.networkInterfaces()));

        // only scan for external ipv4 adapters
        const networks = interfaces.filter(adapter => adapter.family === 'IPv4' && !adapter.internal);

        networks.forEach((network) => {

            const lookup = new scan({
                target: `${network.address}/24`,
                port: 54321,
                status: 'O',
                timeout: 50,
                concurrency: 10
            });

            lookup.on('result', (peer) => {
                const ignoreHost = peer.status.includes('ENETUNREACH');
                if (!ignoreHost) handshake(network, peer);
            });

            lookup.run();
        });
    }
}

module.exports = PeerDiscovery;
