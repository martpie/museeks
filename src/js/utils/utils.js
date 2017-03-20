/*
|--------------------------------------------------------------------------
| Utils
|--------------------------------------------------------------------------
*/

import path    from 'path';
import fs      from 'fs';
import mmd     from 'musicmetadata';
import globby  from 'globby';
import Promise from 'bluebird';

const musicmetadataAsync = Promise.promisify(mmd);

/**
 * Parse an int to a more readable string
 *
 * @param int duration
 * @return string
 */

const parseDuration = (duration) => {
    if(duration !== null && duration !== undefined) {
        let hours   = parseInt(duration / 3600);
        let minutes = parseInt(duration / 60) % 60;
        let seconds = parseInt(duration % 60);

        hours = hours < 10 ? `0${hours}` : hours;
        minutes = minutes < 10 ? `0${minutes}` : minutes;
        seconds = seconds < 10 ? `0${seconds}` : seconds;
        let result = hours > 0 ? `${hours}:` : '';
        result += `${minutes}:${seconds}`;

        return result;
    }

    return '00:00';
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
        .map((d, i) => {
            return i === 0 ? d : encodeURIComponent(d);
        })
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

const parseBase64 = (format, data) => {
    return `data:image/${format};base64,${data}`;
};

/**
 * Sort an array of int by ASC or DESC, then remove all duplicates
 *
 * @param array  array of int to be sorted
 * @param string 'asc' or 'desc' depending of the sort needed
 * @return array
 */
const simpleSort = (array, sorting) => {
    if(sorting === 'asc') {
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
        if(!result.includes(item)) result.push(item);
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
            if(subfolder.includes(folder) && i !== j && !foldersToBeRemoved.includes(folder)) {
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
        album        : 'Unknown',
        albumartist  : [],
        artist       : ['Unknown artist'],
        disk         : {
            no: 0,
            of: 0
        },
        duration     : 0,
        genre        : [],
        loweredMetas : {},
        path         : '',
        playCount    : 0,
        title        : '',
        track        : {
            no: 0,
            of: 0
        },
        year         : ''
    };
};

const getLoweredMeta = (metadata) => {
    return {
        artist      : metadata.artist.map((meta) => stripAccents(meta.toLowerCase())),
        album       : stripAccents(metadata.album.toLowerCase()),
        albumartist : metadata.albumartist.map((meta) => stripAccents(meta.toLowerCase())),
        title       : stripAccents(metadata.title.toLowerCase()),
        genre       : metadata.genre.map((meta) => stripAccents(meta.toLowerCase()))
    };
};

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
        path    : track,
        title   : path.parse(track).base,
    };

    metadata.loweredMetas = getLoweredMeta(metadata);
    return metadata;
};

const getMusicMetadata = async (track) => {
    const defaultMetadata = getDefaultMetadata();

    let data;
    try {
        const stream = fs.createReadStream(track);
        data = await musicmetadataAsync(stream, { duration: true });
        delete data.picture;
        stream.close();
    } catch (err) {
        data = defaultMetadata;
        console.warn(`An error occured while reading ${track} id3 tags: ${err}`);
    }

    const metadata = {
        ...defaultMetadata,
        ...data,
        album        : data.album === null || data.album === '' ? 'Unknown' : data.album,
        artist       : data.artist.length === 0 ? ['Unknown artist'] : data.artist,
        duration     : data.duration === '' ? 0 : data.duration,
        path         : track,
        title        : data.title === null || data.title === '' ? path.parse(track).base : data.title,
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
const getMetadata = async (track) => {
    // metadata should have the same shape as getDefaultMetadata() object
    const wavFile = path.extname(track).toLowerCase() === '.wav';
    const metadata = wavFile ? await getWavMetadata(track) : await getMusicMetadata(track);
    return metadata;
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
    if(!trackPath) {
        return null;
    }

    const stream = fs.createReadStream(trackPath);

    const data = await musicmetadataAsync(stream);

    if(data.picture[0]) { // If cover in id3
        return parseBase64(data.picture[0].format, data.picture[0].data.toString('base64'));
    }

    // scan folder for any cover image
    const folder = path.dirname(trackPath);
    const pattern = path.join(folder, '*');
    const matches = await globby(pattern, { nodir: true, follow: false });

    return matches.find((elem) => {
        const parsedPath = path.parse(elem);

        return ['album', 'albumart', 'folder', 'cover'].includes(parsedPath.name.toLowerCase())
            && ['.png', '.jpg', '.bmp', '.gif'].includes(parsedPath.ext.toLowerCase()) ;
    });
};

export default {
    parseDuration,
    getStatus,
    parseUri,
    simpleSort,
    stripAccents,
    removeUselessFolders,
    chunkArray,
    getMetadata,
    fetchCover,
};
