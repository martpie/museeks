/*
|--------------------------------------------------------------------------
| Utils
|--------------------------------------------------------------------------
*/

import path from 'path';
import fs from 'fs';
import util from 'util';
import globby from 'globby';

const mmd = require('music-metadata');

const stat = util.promisify(fs.stat);

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
    artist       : ['Unknown artist'],
    disk         : {
      no: 0,
      of: 0,
    },
    duration     : 0,
    genre        : [],
    loweredMetas : {},
    path         : '',
    playCount    : 0,
    title        : '',
    track        : {
      no: 0,
      of: 0,
    },
    year         : null,
  };
};

const parseMusicMetadata = (data, trackPath) => {
  if (typeof data === 'object') {
    const { common, format } = data;

    const metadata = {
      album    : common.album,
      artist   : common.artists || (common.artist && [common.artist]) || (common.albumartist && [common.albumartist]),
      disk     : common.disk,
      duration : format.duration,
      genre    : common.genre,
      title    : common.title || path.parse(trackPath).base,
      track    : common.track,
      year     : common.year,
    };

    // HACK Yes, this is terribly hacky, I want to change that
    // remove all the undefined values to avoid conflicts with the spread
    // notation
    for (const key in metadata) {
      if (metadata[key] === undefined) {
        delete metadata[key];
      }
    }

    return metadata;
  }

  return {};
};

const getLoweredMeta = (metadata) => {
  return {
    artist: metadata.artist.map((meta) => stripAccents(meta.toLowerCase())),
    album: stripAccents(metadata.album.toLowerCase()),
    title: stripAccents(metadata.title.toLowerCase()),
    genre: metadata.genre.map((meta) => stripAccents(meta.toLowerCase())),
  };
};

/**
 * Get a file metadata
 *
 * @param path (string)
 * @return object
 *
 */
const getMetadata = async (trackPath) => {
  let data;

  try {
    const stats = await stat(trackPath);
    data = await mmd.parseFile(trackPath, { native: true, skipCovers: true, fileSize: stats.size, duration: true });
  } catch (err) {
    console.warn(`An error occured while reading ${trackPath} id3 tags: ${err}`);
  }

  // Let's try to define something with what we got so far...
  const parsedData = parseMusicMetadata(data, trackPath);
  const defaultMetadata = getDefaultMetadata();

  const metadata = {
    ...defaultMetadata,
    ...parsedData,
    path: trackPath,
  };

  metadata.loweredMetas = getLoweredMeta(metadata);

  // Let's try another wat to retrieve a track duration
  if (!metadata.duration) {
    try {
      metadata.duration = await getAudioDurationAsync(trackPath);
    } catch (err) {
      console.warn(`An error occured while getting ${trackPath} duration: ${err}`);
    }
  }

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

  const data = await mmd.parseFile(trackPath);
  const picture = data.common.picture[0];

  if(picture) { // If cover in id3
    return parseBase64(picture.format, picture.data.toString('base64'));
  }

  // scan folder for any cover image
  const folder = path.dirname(trackPath);
  const pattern = path.join(folder, '*');
  const matches = await globby(pattern, { follow: false });

  return matches.find((elem) => {
    const parsedPath = path.parse(elem);

    return ['album', 'albumart', 'folder', 'cover'].includes(parsedPath.name.toLowerCase())
      && ['.png', '.jpg', '.bmp', '.gif'].includes(parsedPath.ext.toLowerCase()) ;
  });
};

export default {
  parseDuration,
  parseUri,
  simpleSort,
  stripAccents,
  removeUselessFolders,
  chunkArray,
  getMetadata,
  fetchCover,
};
