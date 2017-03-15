const linvodb = require('linvodb3');
const Promise = require('bluebird');

const Playlist = new linvodb('playlist', {
    name: String,
    tracks: {
        type: [String],
        default: []
    }
});

Promise.promisifyAll(Playlist);

export default Playlist;
