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
            all: [],
            sub: []
        },

        columns: {
            data: {
                track : {
                    id: 'track',
                    name: 'Track',
                    width: null,
                    sort: undefined,
                    sortAdded: undefined,
                    sortKey: 'title'
                },
                duration: {
                    id: 'duration',
                    name: 'Duration',
                    width: 100,
                    sort: undefined,
                    sortAdded: undefined,
                    sortKey: 'duration'
                },
                artist: {
                    id: 'artist',
                    name: 'Artist',
                    width: 300,
                    sort: undefined,
                    sortAdded: undefined,
                    sortKey: 'artist'
                },
                album: {
                    id: 'album',
                    name: 'Album',
                    width: 350,
                    sort: undefined,
                    sortAdded: undefined,
                    sortKey: 'album'
                },
                genre: {
                    id: 'genre',
                    name: 'Genre',
                    width: 150,
                    sort: undefined,
                    sortAdded: undefined,
                    sortKey: 'genre'
                },
                owner: {
                    id: 'owner',
                    name: 'Owner',
                    width: 70,
                    sort: undefined,
                    sortAdded: undefined,
                    sortKey: 'owner.hostname'
                },
            },
            order: ['track', 'duration', 'artist', 'album', 'genre', 'owner']
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
