import os from 'os';

export default {

    network: {
        observers: [],
        peers: [],
        output: {
            ip: null
        },
        me: {
            hostname: os.hostname(),
            platform: os.platform(),
            ip: 'localhost',
        }
    },

    // new state above here

    tracks: {
        library: {                   // Tracks of the library view
            all: null,               // All tracks
            sub: null                // Filtered tracks (e.g search)
        },
        playlist: {
            all: null,
            sub: null
        }
    },

    tracksCursor: 'library',         // 'library' or 'playlist'

    queue: [],                       // Tracks to be played
    queueCursor: null,               // The cursor of the queue

    oldQueue: null,                  // Queue backup (in case of shuffle)

    playlists: [],

    playerStatus: 'stop',            // Player status
    cover: null,                     // Current trackplaying cover
    toasts: [],                      // The array of toasts
    refreshingLibrary: false,        // If the app is currently refreshing the app
    repeat: 'none',                  // the current repeat state (one, all, none)
    shuffle: false,                  // If shuffle mode is enabled
    refreshProgress: 0               // Progress of the refreshing library
};
