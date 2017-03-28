import Promise from 'bluebird';
import { flatten } from 'lodash';
import scan from 'evilscan';
import http from 'axios';
import extend from 'xtend';
import os from 'os';
import utils from '../../shared/utils/utils';

import lib from './index'

class PeerDiscovery {
    constructor() {
    }
    handshake = (network, peer) => {
        const { config } = lib.store.getState();

        return http({
            method: 'POST',
            url: `${utils.peerEndpoint(peer)}/api/handshake`,
            data: {
                name: config.name,
                hostname: os.hostname(),
                platform: os.platform(),
                ip: network
            }
        })
        .then((response) => response.data)
        .then((peerInfo) => extend(peerInfo, { ip : peer.ip }))
        .catch((err) => {
            const ignore = err.response.status === 404;

            if (!ignore) {
                console.log(err, `Got error ${err.code} when handshaking with ${peer.ip}`);
            }
        });
    }
    scan = () => {
        // Get this computers networks array (the array of IPs)
        const interfaces = flatten(Object.values(os.networkInterfaces()));
        // Only include external ipv4 adapters
        const networks = interfaces.filter(adapter => adapter.family === 'IPv4' && !adapter.internal).map(network => network.address);
        const port = 54321;

        const scanNetwork = (network) => {
            return new Promise((resolve, reject) => {
                const result = [];
                const lookup = new scan({
                    target: `${network}/24`,
                    port,
                    status: 'O',
                    timeout: 50,
                    concurrency: 10
                });

                lookup.on('result', (peer) => {
                    // Filter out ourselves and networks that error
                    const ignoreHost = peer.status.includes('ENETUNREACH') || networks.includes(peer.ip);

                    if (!ignoreHost) this.handshake(network, peer).then((peer) => {
                        result.push(peer);
                    });
                });

                lookup.on('error', (err) => {
                    reject()
                });

                lookup.on('done', () => {
                    resolve(result)
                });

                lookup.run();
            })
        }

        if (lib.store.getState().config.discoverPeers) {
            return Promise.all(networks.map(scanNetwork))
                .then(flatten);

        } else {
            return Promise.resolve([]);
        }
    }
}

export default PeerDiscovery;
