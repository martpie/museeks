import Promise from 'bluebird';
import Electron from './fixtures/Electron';
import { range } from 'range';
import mkdirp from 'mkdirp';
import http from 'axios';
import mutate from 'xtend/mutable';
import fs from 'fs-extra';
import path from 'path';

const srcRoot = path.resolve(__dirname, '..');
const testMp3 = path.resolve(srcRoot, './test/fixtures/test.mp3');

const numPeers = 1;

const peerConfigs = range(0, numPeers).map((peer, peerNumber) => {
    const peerDataRoot = `/tmp/museeks-test/${Date.now()}/${peerNumber}`;

    return {
        hostname: 'localhost',
        testDataPath: `${peerDataRoot}/data`,
        config: {
            path: `${peerDataRoot}/config`,
            theme: 'dark',
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
}));

// create test environment for each peer
const peers = peerConfigs.map((config) => {
    const peer = Electron({ env: config });
    mkdirp(config.config.path);
    mkdirp(config.config.electron.database.path);
    fs.copySync(testMp3, config.testDataPath);
    return mutate(peer, config);
});

// start all electron instances
const startPeers = Promise.map(peers, (peer) => peer.start());

const runTests = () => {

    const getElectronLogs = () => {
        peers.forEach((peer) => {
            peer.client.getMainProcessLogs().then((logs) => {
                logs.forEach((log) => {
                    console.log('ELECTRON', log);
                });
            });
        });
    }

    setConfig(peers[0], 'devMode', true);

    setInterval(getElectronLogs, 1000);
}

const setConfig = (peer, key, value) => {
    const host = peer.hostname;
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

startPeers.then(runTests);
