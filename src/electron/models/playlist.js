import linvodb from 'linvodb3';
import Promise from 'bluebird';

const Playlist = new linvodb('playlist', {
    name: String,
    tracks: {
        type: [String],
        default: []
    }
});

Promise.promisifyAll(Playlist);
Promise.promisifyAll(Playlist.find().__proto__);

export default Playlist;
