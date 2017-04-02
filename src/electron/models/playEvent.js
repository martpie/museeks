import Linvodb from 'linvodb3';
import Promise from 'bluebird';

// save metadata and previous _ids in case library is recreated
const PlayEvent = new Linvodb('playEvent', {
    user: Number,
    timestamp: Date,

    _ids: [String], // _ids by which this track has been known over time
    title: String,
    album: String,
    artist: [String],
    loweredMetas: {
        title: String,
        album: String,
        artist: [String]
    },
    playCount: Number
});

PlayEvent.ensureIndex({ fieldName: '_ids' });

Promise.promisifyAll(PlayEvent);
Promise.promisifyAll(PlayEvent.find().__proto__);

export default PlayEvent;
