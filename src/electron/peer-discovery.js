import Promise from 'bluebird';
import flatten from 'flatten';
import scan from 'evilscan';
import http from 'axios';
import extend from 'xtend';
import os from 'os';

class PeerDiscovery {
    constructor(store, lib) {
        this.lib = lib;

        // scanning at startup slows application load time
        const scanDelay = 2000;
        setTimeout(() => this.scanForPeers(), scanDelay);
    }
    handshake (network, peer) {
        return http({
            method: 'POST',
            url: `http://${peer.ip}:54321/api/v1/handshake`,
            data: {
                hostname: os.hostname(),
                platform: os.platform(),
                ip: network.address
            }
        })
        .then((response) => response.data)
        .then((peerInfo) => {
            return this.lib.actions.network.peerFound(extend(peerInfo, { ip : peer.ip }));
        })
        .catch((err) => {
            console.log(err)
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

                if (!ignoreHost) this.handshake(network, peer);
            });

            lookup.run();
        });
    }
}

export default PeerDiscovery;
