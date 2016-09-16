export default {
    tracks: {
        library: { // Tracks of the library view
            all: null, // All tracks
            sub: null  // Filtered tracks (e.g search)
        },
        playlist: {
            all: null,
            sub: null
        }
    },

    tracksCursor      : 'library',  // 'library' or 'playlist'

    queue             :  [],    // Tracks to be played
    queueCursor       :  null,  // The cursor of the queue

    oldQueue          :  null,  // Queue backup (in case of shuffle)

    playlists         :  null,

    playerStatus      : 'stop', // Player status
    cover             :  null,  // Current trackplaying cover
    notifications     :  [],    // The array of notifications
    refreshingLibrary :  false, // If the app is currently refreshing the app
    repeat            :  false, // the current repeat state (one, all, false)
    shuffle           :  false, // If shuffle mode is enabled
    refreshProgress   :  0,     // Progress of the refreshing library
};
