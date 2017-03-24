import os from 'os';
import { flatten } from 'lodash';
import { app } from 'electron';

const interfaces = flatten(Object.values(os.networkInterfaces()));
const networks = interfaces.filter(adapter => adapter.family === 'IPv4' && !adapter.internal);
const ips = networks.map(network => network.address);
const hostname = os.hostname();
const platform = os.platform();

export default {

    network: {
        observers: [],
        peers: [],
        output: {
            ip: 'localhost',
            hostname,
            platform,
            isLocal: true
        },
        me: {
            ips,
            hostname,
            platform,
            isLocal: true
        }
    },

    // new state above here

    tracks: {
        tracksCursor: 'library',     // 'library' or 'playlist'
        library: {                   // Tracks of the library view
            all: [],               // All tracks
            sub: []                // Filtered tracks (e.g search)
        },
        playlist: {
            all: [],
            sub: []
        }
    },

    library: {
        refreshingLibrary: false,        // If the app is currently refreshing the app
        refreshProgress: 0               // Progress of the refreshing library
    },

    playlists: [],

    queue: [],                       // Tracks to be played
    queueCursor: null,               // The cursor of the queue
    oldQueue: null,                  // Queue backup (in case of shuffle)

    player: {
        currentTrack: {},                // The currently playing track
        playerStatus: 'stop',            // Player status
        cover: null,                     // Current trackplaying cover
        repeat: 'none',                  // the current repeat state (one, all, none)
        shuffle: false                   // If shuffle mode is enabled
    },

    toasts: [],                          // The array of toasts

    system: {
        version: app.getVersion()
    }
};
