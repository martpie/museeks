import os from 'os';
import { flatten } from 'lodash';

const interfaces = flatten(Object.values(os.networkInterfaces()));
const networks = interfaces.filter((adapter) => adapter.family === 'IPv4' && !adapter.internal);
const ips = networks.map((network) => network.address);

const hostname = os.hostname();
const platform = os.platform();

export default {

    network: {
        scanPending: false,
        observers: [],                  // Array of peers who are observing
        peers: [],                      // Array of peers on the network
        output: {                       // The output device (either us or a peer)
            ip: 'localhost',
            hostname,
            platform,
            isLocal: true               // isLocal bool is used to show if output.hostname === me.hostname
        },
        me: {                           // The peer info for this machine
            ips,
            hostname,
            platform,
            isLocal: true
        }
    },

    tracks: {
        tracksCursor: 'library',         // 'library' or 'playlist'
        library: {                       // Tracks of the library view
            data: {},
            all: [],                     // All tracks
            sub: []                      // Filtered tracks (e.g search)
        },
        playlist: {
            data: {},
            all: [],
            sub: []
        }
    },

    library: {
        refreshingLibrary: false,        // If the app is currently refreshing the app
        refreshProgress: 0               // Progress of the refreshing library
    },

    playlists: [],

    queue: [],                           // Tracks to be played
    queueCursor: null,                   // The cursor of the queue

    player: {
        history: [],                     // The history of songs played from the current queue
        historyCursor: -1,               // The position of the currently playing track in the history queue
        currentTrack: {},                // The currently playing track
        playStatus: 'stop',              // Player status
        cover: undefined,                // Current trackplaying cover
        repeat: 'none',                  // the current repeat state (one, all, none)
        shuffle: false,                  // If shuffle mode is enabled
        elapsed: 0,                      // How much time has elapsed
        volume: 0,
    },

    toasts: [],                          // The array of toasts

    system: {
        // version: app.getVersion()
    }
};
