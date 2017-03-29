import Promise from 'bluebird';
import Electron from './fixtures/Electron';
import Hapi from 'hapi';
import { range } from 'range';
import mkdirp from 'mkdirp';
import http from 'axios';
import mutate from 'xtend/mutable';
import fs from 'fs-extra';
import path from 'path';

const srcRoot = path.resolve(__dirname, '..');
const testMp3 = path.resolve(srcRoot, './test/fixtures/test.mp3');

const numPeers = 1;

const server = new Hapi.Server();
const observerPort = 54555;
server.connection({ port: observerPort });

const observerCallback = (payload) => console.log('observer api hit', payload);

server.route({
    method: 'POST',
    path: '/api/network/event',
    handler: (req, res) => {
        observerCallback(req.payload);
        res();
    }
});

server.start();

const peerDataRoot = (peerNumber) => `/tmp/museeks-test/${Date.now()}/${peerNumber}`;

const peerConfigs = range(0, numPeers).map((peer, peerNumber) => ({
    ip: 'localhost',
    testDataPath: `${peerDataRoot(peerNumber)}/data`,
    config: {
        path: `${peerDataRoot(peerNumber)}/config/config.json`,
        theme: 'dark',
        discoverPeers: false,
        electron: {
            api: {
                port: 54321 + peerNumber
            },
            database: {
                path: `${peerDataRoot(peerNumber)}/database`
            }
        }
    }
}));

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
};

// const setConfig = (peer, key, value) => {
//     const host = peer.ip;
//     const port = peer.config.electron.api.port;
//
//     return http({
//         method: 'POST',
//         url: `http://${host}:${port}/api/store/dispatch`,
//         json: true,
//         data: {
//             type: 'CONFIG/SET',
//             payload: { key, value }
//         }
//     });
// };

const notifyPeerFound = (peer, foundPeer) => {
    const host = peer.ip;
    const port = peer.config.electron.api.port;

    return http({
        method: 'POST',
        url: `http://${host}:${port}/api/store/dispatch`,
        json: true,
        data: {
            type: 'NETWORK/PEER_FOUND',
            payload: {
                peer: {
                    ip: foundPeer.ip
                }
            }
        }
    });
};

const runTests = () => {

    // // test: play song from library
    // // two peers
    // // peer 1 requests the library of peer 2
    // return lib.actions.network.find({
    //     sources: [peer[2].ip]
    // }).then((tracks) => {
    //     // peer 1 plays a song from the library of peer 2
    //     return lib.actions.network.start({
    //         source: peer[1],
    //         destination: peer[2],
    //         track: 'uri-of-track'
    //     }).then(() => {
    //         // peer 1 receives now playing state updates from peer 2
    //
    //         // const playEvent = () => {
    //         //     return lib.api.network.observe({ ip : peer[2] }).then(() => {
    //         //         return lib.api.player.play({ ip : peer[2] }).then(() => {
    //         //         });
    //         //     });
    //         // }
    //         // peer 1 receives destroy event from peer 2
    //     });
    // });

    const getElectronLogs = () => {
        peers.forEach((peer, peerNumber) => {
            peer.client.getMainProcessLogs().then((logs) => {
                logs.forEach((log) => {
                    console.log(`ELECTRON ${peerNumber}`, log);
                });
            });
        });
    };

    setInterval(getElectronLogs, 1000);
};

startPeers()
.then(runtimeConfiguration)
.then(runTests);
