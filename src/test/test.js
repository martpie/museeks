import Electron from './fixtures/Electron';
import { range } from 'range';
import mkdirp from 'mkdirp';

const numPeers = 3;

const peerConfigs = range(0, numPeers).map((peer, peerNumber) => ({
    config: {
        electron: {
            api: {
                port: 54321 + peerNumber
            },
            database: {
                path: `/tmp/museeks-test-database/${Date.now()}/${peerNumber}/`
            }
        }
    }
}));

// create all peer database paths
peerConfigs.forEach((peer) => mkdirp(peer.config.electron.database.path));

const peers = peerConfigs.map((config) => {
    return Electron({ env: config });
})

peers.forEach((peer) => peer.start());

const runTests = () => {

    console.log(peers)

    const getElectronLogs = () => {
        peers.forEach((peer) => {
            peer.client.getMainProcessLogs().then((logs) => {
                logs.forEach((log) => {
                    console.log('ELECTRON', log)
                })
            })
        });
    }

    setInterval(getElectronLogs, 1000);
}

setTimeout(runTests, 2000);
