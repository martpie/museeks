import Promise from 'bluebird';
import { flatten } from 'lodash';
import scan from 'evilscan';
import http from 'axios';
import extend from 'xtend';
import os from 'os';

const me = {
    hostname: os.hostname(),
    platform: os.platform(),
    ip: 'localhost'
};

class PeerDiscovery {
    constructor(lib) {
        this.lib = lib;

        // scanning at startup slows application load time
        const scanDelay = 2000;
        setTimeout(() => this.scanForPeers(), scanDelay);
    }
    handshake (network, peer) {
        const { config } = this.lib.store.getState();
        const apiPort = config.electron.api.port;

        return http({
            method: 'POST',
            url: `http://${peer.ip}:${apiPort}/api/handshake`,
            data: {
                name: config.name,
                hostname: os.hostname(),
                platform: os.platform(),
                ip: network.address
            }
        })
        .then((response) => response.data)
        .then((peerInfo) => extend(peerInfo, { ip : peer.ip }))
        .then((peer) => this.lib.store.dispatch(this.lib.actions.network.peerFound(peer)))
        .catch((err) => {
            const ignore = err.response.status === 404;

            if (!ignore) {
                console.log(err, `Got error ${err.code} when handshaking with ${peer.ip}`);
            }
        });
    }
    scanForPeers() {
        const interfaces = flatten(Object.values(os.networkInterfaces()));
        const networks = interfaces.filter(adapter => adapter.family === 'IPv4' && !adapter.internal); // only scan for external ipv4 adapters
        const apiPort = this.lib.store.getState().config.electron.api.port;

        const scanNetwork = (network) => {

            const lookup = new scan({
                target: `${network.address}/24`,
                port: apiPort,
                status: 'O',
                timeout: 50,
                concurrency: 10
            });

            lookup.on('result', (peer) => {
                const ignoreHost = peer.status.includes('ENETUNREACH');

                if (!ignoreHost) this.handshake(network, peer);
            });

            lookup.run();
        }

        if (this.lib.store.getState().config.discoverPeers) {
            networks.forEach(scanNetwork);
        }
    }
}

export default PeerDiscovery;
