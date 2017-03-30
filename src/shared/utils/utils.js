import path from 'path';
import fs from 'fs';
import mmd from 'musicmetadata';
import globby from 'globby';
import Promise from 'bluebird';
import { omit } from 'lodash';
import { range } from 'range';

const musicmetadata = Promise.promisify(mmd);

/**
 * Get the me object with a single IP instead of an array
 * This is done by finding the adaptor in the same DNS zone
 * as the peer.
 *
 * @param int duration
 * @return string
 */

const getMeWithIP = (me, peer) => {
    // Get the IP that matches the DNS zone
    const getIP = () => {
        if (me.ips.length === 1) {
            return me.ips[0];
        } else {
            // Get the DNS zone. 192.168.0.50 returns 192.168.0
            const getDnsZone = (ip) => ip.substr(0, ip.lastIndexOf('.'));
            const peerDnsZone = getDnsZone(peer.ip);
            return me.ips.find((ip) => getDnsZone(ip) === peerDnsZone);
        }
    };

    const result = omit(me, ['ips', 'isLocal']);
    result.ip = getIP();
    return result;
};


/**
 * Parse an int to a more readable string
 *
 * @param int duration
 * @return string
 */

const parseDuration = (duration) => {
    if (duration) {
        let hours = parseInt(duration / 3600);
        let minutes = parseInt(duration / 60) % 60;
        let seconds = parseInt(duration % 60);

        hours = hours < 10 ? `0${hours}` : hours;
        minutes = minutes < 10 ? `0${minutes}` : minutes;
        seconds = seconds < 10 ? `0${seconds}` : seconds;
        let result = hours > 0 ? `${hours}:` : '';
        result += `${minutes}:${seconds}`;

        return result;
    } else {
        return '00:00';
    }
};

/**
 * Format a list of tracks to a nice status
 *
 * @param array tracks
 * @return string
 */
const getStatus = (tracks) => {
    const status = parseDuration(tracks.map((d) => d.duration).reduce((a, b) => a + b, 0));
    return `${tracks.length} tracks, ${status}`;
};

/**
 * Parse an URI, encoding some characters
 *
 * @param string uri
 * @return string
 */
const parseUri = (uri) => {
    const root = process.platform === 'win32' ? '' : path.parse(uri).root;
    const location = uri
        .split(path.sep)
        .map((d, i) => i === 0
            ? d
            : encodeURIComponent(d)
        )
        .reduce((a, b) => path.join(a, b));

    return `file://${root}${location}`;
};

/**
 * Parse data to be used by img/background-image with base64
 *
 * @param string format of the image
 * @param string data base64 string
 * @return string
 */

/**
 * Sort an array of int by ASC or DESC, then remove all duplicates
 *
 * @param array  array of int to be sorted
 * @param string 'asc' or 'desc' depending of the sort needed
 * @return array
 */
const simpleSort = (array, sorting) => {
    if (sorting === 'asc') {
        array.sort((a, b) => {
            return a - b;
        });
    } else if (sorting === 'desc') {
        array.sort((a, b) => {
            return b - a;
        });
    }


    const result = [];
    array.forEach((item) => {
        if (!result.includes(item)) result.push(item);
    });

    return result;
};

/**
 * Strip accent from String. From https://jsperf.com/strip-accents
 *
 * @param String str
 * @return String
 */
const stripAccents = (str) => {
    const accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
    const fixes = 'AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz';
    const split = accents.split('').join('|');
    const reg = new RegExp(`(${split})`, 'g');

    function replacement(a) {
        return fixes[accents.indexOf(a)] || '';
    }

    return str.replace(reg, replacement).toLowerCase();
};

/**
 * Remove duplicates (realpath) and useless children folders
 *
 * @param array the array of folders path
 * @return array
 */
const removeUselessFolders = (folders) => {
    // Remove duplicates
    let filteredFolders = folders.filter((elem, index) => {
        return folders.indexOf(elem) === index;
    });

    const foldersToBeRemoved = [];

    filteredFolders.forEach((folder, i) => {
        filteredFolders.forEach((subfolder, j) => {
            if (subfolder.includes(folder) && i !== j && !foldersToBeRemoved.includes(folder)) {
                foldersToBeRemoved.push(subfolder);
            }
        });
    });

    filteredFolders = filteredFolders.filter((elem) => {
        return !foldersToBeRemoved.includes(elem);
    });

    return filteredFolders;
};

/**
 * Cut an array in smaller chunks
 *
 * @param array the array to be chunked
 * @param int the length of each chunk
 * @return array
 */
const chunkArray = (array, chunkLength) => {
    const chunks = [];

    for(let i = 0, length = array.length; i < length; i += chunkLength) {
        chunks.push(array.slice(i, i + chunkLength));
    }

    return chunks;
};

const getDefaultMetadata = () => {
    return {
        album: 'Unknown',
        albumartist: [],
        artist: ['Unknown artist'],
        disk: {
            no: 0,
            of: 0
        },
        duration: 0,
        genre: [],
        loweredMetas: {},
        path: '',
        playCount: 0,
        title: '',
        track: {
            no: 0,
            of: 0
        },
        year: ''
    };
};

const getLoweredMeta = (metadata) => ({
    artist: metadata.artist.map((meta) => stripAccents(meta.toLowerCase())),
    album: stripAccents(metadata.album.toLowerCase()),
    albumartist: metadata.albumartist.map((meta) => stripAccents(meta.toLowerCase())),
    title: stripAccents(metadata.title.toLowerCase()),
    genre: metadata.genre.map((meta) => stripAccents(meta.toLowerCase()))
});

const getWavMetadata = async (track) => {
    const defaultMetadata = getDefaultMetadata();

    let audioDuration = 0;
    try {
        audioDuration = await getAudioDurationAsync(track);
    } catch (err) {
        console.warn(err);
        audioDuration = 0;
    }

    const metadata = {
        ...defaultMetadata,
        duration: audioDuration,
        path: track,
        title: path.parse(track).base
    };

    metadata.loweredMetas = getLoweredMeta(metadata);
    return metadata;
};

const getMusicMetadata = async (track) => {
    const defaultMetadata = getDefaultMetadata();

    let data;
    try {
        const stream = fs.createReadStream(track);
        data = await musicmetadata(stream, { duration: true });
    } catch (err) {
        data = defaultMetadata;
        console.warn(`An error occured while reading ${track} id3 tags: ${err}`);
    }

    // remove any album art metadata - we don't want to store this in the database
    delete data.picture;

    const metadata = {
        ...defaultMetadata,
        ...data,
        album: data.album === null || data.album === '' ? 'Unknown' : data.album,
        artist: data.artist.length === 0 ? ['Unknown artist'] : data.artist,
        duration: data.duration === '' ? 0 : data.duration,
        path: track,
        title: data.title === null || data.title === '' ? path.parse(track).base : data.title,
    };

    metadata.loweredMetas = getLoweredMeta(metadata);

    if (metadata.duration === 0) {
        try {
            metadata.duration = await getAudioDurationAsync(track);
        } catch (err) {
            console.warn(`An error occured while getting ${track} duration: ${err}`);
        }
    }
    return metadata;
};

/**
 * Get a file metadata
 *
 * @param path (string)
 * @return object
 *
 */
const getMetadata = (track) => {
    // metadata should have the same shape as getDefaultMetadata() object
    const wavFile = path.extname(track).toLowerCase() === '.wav';
    const metadata = wavFile
        ? getWavMetadata
        : getMusicMetadata;

    return metadata(track);
};

const getAudioDurationAsync = (path) => {
    const audio = new Audio;

    return new Promise((resolve, reject) => {
        audio.addEventListener('loadedmetadata', () => {
            resolve(audio.duration);
        });

        audio.addEventListener('error', (e) => {
            const message = `Error getting audio duration: (${e.target.error.code}) ${path}`;
            reject(new Error(message));
        });

        audio.preload = 'metadata';
        audio.src = path;
    });
};

const fetchCover = async (trackPath) => {
    if (!trackPath) {
        return null;
    }

    const stream = fs.createReadStream(trackPath);

    const data = await musicmetadata(stream);

    if (data.picture[0]) { // If cover in id3
        return {
            format: 'base64',
            data: data.picture[0].data
        };
    } else {
        // scan folder for any cover image
        const folder = path.dirname(trackPath);
        const pattern = path.join(folder, '*');
        const matches = await globby(pattern, { nodir: true, follow: false });

        const filepath = matches.find((elem) => {
            const parsedPath = path.parse(elem);

            return ['album', 'albumart', 'folder', 'cover'].includes(parsedPath.name.toLowerCase())
                && ['.png', '.jpg', '.bmp', '.gif'].includes(parsedPath.ext.toLowerCase());
        });

        return {
            format: 'path',
            data: filepath
        };
    }
};

const supportedExtensions = [
    // MP3 / MP4
    '.mp3',
    '.mp4',
    '.aac',
    '.m4a',
    '.3gp',
    '.wav',

    // Opus
    '.ogg',
    '.ogv',
    '.ogm',
    '.opus',

    // Flac
    '.flac'
];

const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

const peerEndpoint = (peer) => {
    const protocol = 'http';
    const host = peer.isLocal ? 'localhost' : peer.ip;
    const port = '54321';

    return `${protocol}://${host}:${port}`;
};

const peerIsMe = ({ peer, me }) => peer.hostname === me.hostname;

const trackEndpoint = ({ _id, peer }) => `${peerEndpoint(peer)}/api/tracks/download?_id=${_id}`;

const coverEndpoint = ({ _id, peer }) => `${peerEndpoint(peer)}/api/tracks/cover?_id=${_id}`;

const dispatchEndpoint = ({ peer }) => `${peerEndpoint(peer)}/api/store/dispatch`;

const getNextQueueCursor = (data) => {

    // console.log('getNextQueueCursor INPUT\n\n', data);

    const {
        direction,
        queue,
        history,
        repeat,
        shuffle,
        currentTime
    } = data;

    let {
        queueCursor,
        historyCursor
    } = data;

    const nextQueueCursor = () => {
        if (repeat === 'one') {
            return queueCursor;
        } else if (shuffle) {
            const choices = range(0, queue.length).filter((choice) => choice !== queueCursor);
            return pickRandom(choices);
        } else if (repeat === 'all' && queueCursor === queue.length - 1) { // is last track
            return 0; // start with new track
        } else if (queueCursor === queue.length - 1) { // is last track
            return null; // stop playing
        } else {
            return queueCursor + 1;
        }
    };

    // history cursor is null when it's positioned prior to the first element in the history array
    const inHistory = historyCursor > -1 || historyCursor === null;

    if (direction === 'next') {

        // if we're before the head of history
        if (historyCursor === null) {

            // move to the head of history
            historyCursor = 0;

        // if we're currently playing a track from our history
        } else if (inHistory) {

            // move one step forward in the history
            historyCursor = historyCursor + 1;

            // if we moved past the tail of the history queue
            if (historyCursor === history.length) {

                // disable the history cursor
                historyCursor = -1;

                // set the queue cursor to the next track
                queueCursor = nextQueueCursor();
            }
        } else {

            // set the queue cursor to the next track
            queueCursor = nextQueueCursor();
        }

    } else if (direction === 'previous') {

        // if track started less than 5 seconds ago, play the previous track, otherwise replay the current track
        if (currentTime < 5) {

            // if we're currently playing a track from our history
            if (inHistory) {

                // if we're in the history queue
                if (historyCursor !== null) {

                    // move one step back in the history
                    historyCursor = historyCursor - 1;

                    if (historyCursor === -1) {
                        // we tried to move past the head of the history queue, stay at the top
                        historyCursor = null;
                    }
                }
            } else if (historyCursor === -1) {

                // if we only have one item in our history
                if (history.length === 1) {

                    // set the history cursort before teh head of the history queue
                    historyCursor = null;

                } else {

                    // the first time we enter the history, we want to be prior to the last track in the history
                    historyCursor = history.length - 2;
                }
            }
        }
    }

    // console.log('getNextQueueCursor RESULT\n\n', { queueCursor, historyCursor });

    return {
        queueCursor,
        historyCursor
    };
};

const isNumber = (number) => typeof number === 'number' && !isNaN(number);

export default {
    getMeWithIP,
    parseDuration,
    getStatus,
    parseUri,
    simpleSort,
    stripAccents,
    removeUselessFolders,
    chunkArray,
    getMetadata,
    fetchCover,
    supportedExtensions,
    pickRandom,
    peerEndpoint,
    peerIsMe,
    trackEndpoint,
    coverEndpoint,
    dispatchEndpoint,
    getNextQueueCursor,
    isNumber
};
