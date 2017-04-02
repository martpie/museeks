import Linvodb from 'linvodb3';
import Promise from 'bluebird';

const Track = new Linvodb('track', {
    album: String,
    albumartist: [String],
    artist: [String],
    cover: {
        default: null
    },
    disk: {
        no: Number,
        of: Number
    },
    duration: Number,
    genre: [String],
    loweredMetas: {
        artist: [String],
        album: String,
        albumartist: [String],
        title: String,
        genre: [String]
    },
    path: String,
    playCount: Number,
    title: String,
    track: {
        no: Number,
        of: Number
    },
    year: String
});

Track.ensureIndex({ fieldName: 'path', unique: true });

Promise.promisifyAll(Track);
Promise.promisifyAll(Track.find().__proto__);
Promise.promisifyAll(Track.findOne().__proto__);

export default Track;
