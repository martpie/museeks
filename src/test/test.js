import Promise from 'bluebird';
import Electron from './fixtures/Electron';
import { range } from 'range';
import mkdirp from 'mkdirp';
import http from 'axios';
import mutate from 'xtend/mutable';
import fs from 'fs-extra';
import path from 'path';
import test from 'tape';

const srcRoot = path.resolve(__dirname, '..');
const testMp3 = path.resolve(srcRoot, './test/fixtures/test.mp3');

const numPeers = 1;

const peerConfigs = range(0, numPeers).map((peer, peerNumber) => {
    const peerDataRoot = `/tmp/museeks-test/${Date.now()}/${peerNumber}`;

    return {
        ip: 'localhost',
        testDataPath: `${peerDataRoot}/data`,
        config: {
            path: `${peerDataRoot}/config/config.json`,
            theme: 'dark',
            discoverPeers: false,
            electron: {
                api: {
                    port: 54321 + peerNumber
                },
                database: {
                    path: `${peerDataRoot}/database`
                }
            }
        }
    }
});

// create all peer database paths
peerConfigs.forEach((peer) => mkdirp(peer.config.electron.database.path));

// create test environment for each peer
const peers = peerConfigs.map((config) => {

    // create peer electron instance
    const peer = Electron({ env: config });

    // create peer data directories
    mkdirp(config.testDataPath);
    mkdirp(path.dirname(config.config.path));
    mkdirp(config.config.electron.database.path);

    // copy test files
    fs.copySync(testMp3, config.testDataPath);

    // add config to peer
    return mutate(peer, config);
});

// start all electron instances
const startPeers = () => Promise.map(peers, (peer) => peer.start());

// prepare each peer's runtime configuration
const runtimeConfiguration = () => {
    // for all peers
    return Promise.map(peers, (peer) => {
        // simulate peer discovery
        return Promise.map(peers, (foundPeer) => notifyPeerFound(peer, foundPeer));
    });
}

const setConfig = (peer, key, value) => {
    const host = peer.ip;
    const port = peer.config.electron.api.port;

    return http({
        method: 'POST',
        url: `http://${host}:${port}/api/v1/store/dispatch`,
        json: true,
        data: {
            type: 'APP_CONFIG_SET',
            payload: { key, value }
        }
    });
}

const notifyPeerFound = (peer, foundPeer) => {
    const host = peer.ip;
    const port = peer.config.electron.api.port;

    return http({
        method: 'POST',
        url: `http://${host}:${port}/api/v1/store/dispatch`,
        json: true,
        data: {
            type: 'APP_NETWORK_PEER_FOUND',
            payload: {
                peer: {
                    ip: foundPeer.ip
                }
            }
        }
    });
}

const runTests = () => {

    // test: get song from library
    // two clients
    // client one

    const getElectronLogs = () => {
        peers.forEach((peer, peerNumber) => {
            peer.client.getMainProcessLogs().then((logs) => {
                logs.forEach((log) => {
                    console.log(`ELECTRON ${peerNumber}`, log)
                })
            })
        });
    }

    setInterval(getElectronLogs, 1000);
}

startPeers()
.then(runtimeConfiguration)
.then(runTests);
