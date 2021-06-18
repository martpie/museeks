import path from 'path';
import * as mmd from 'music-metadata';
import pickBy from 'lodash-es/pickBy';

import { Track } from '../../shared/types/museeks';

/**
 * Parse an int to a more readable string
 */
export const parseDuration = (duration: number | null): string => {
  if (duration !== null) {
    const hours = Math.trunc(duration / 3600);
    const minutes = Math.trunc(duration / 60) % 60;
    const seconds = Math.trunc(duration) % 60;

    const hoursStringified = hours < 10 ? `0${hours}` : hours;
    const minutesStringified = minutes < 10 ? `0${minutes}` : minutes;
    const secondsStringified = seconds < 10 ? `0${seconds}` : seconds;

    let result = hoursStringified > 0 ? `${hoursStringified}:` : '';
    result += `${minutesStringified}:${secondsStringified}`;

    return result;
  }

  return '00:00';
};

/**
 * Parse an URI, encoding some characters
 */
export const parseUri = (uri: string): string => {
  const root = process.platform === 'win32' ? '' : path.parse(uri).root;

  const location = path
    .resolve(uri)
    .split(path.sep)
    .map((d, i) => (i === 0 ? d : encodeURIComponent(d)))
    .reduce((a, b) => path.join(a, b));

  return `file://${root}${location}`;
};

/**
 * Sort an array of string by ASC or DESC, then remove all duplicates
 */
export const simpleSort = (array: string[], sorting: 'asc' | 'desc') => {
  if (sorting === 'asc') {
    array.sort((a, b) => (a > b ? 1 : -1));
  } else if (sorting === 'desc') {
    array.sort((a, b) => (b > a ? -1 : 1));
  }

  const result: string[] = [];
  array.forEach((item) => {
    if (!result.includes(item)) result.push(item);
  });

  return result;
};

/**
 * Strip accent from String. From https://jsperf.com/strip-accents
 */
export const stripAccents = (str: string): string => {
  const accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
  const fixes = 'AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz';
  const split = accents.split('').join('|');
  const reg = new RegExp(`(${split})`, 'g');

  function replacement(a: string) {
    return fixes[accents.indexOf(a)] || '';
  }

  return str.replace(reg, replacement).toLowerCase();
};

/**
 * Remove duplicates (realpath) and useless children folders
 */
export const removeUselessFolders = (folders: string[]): string[] => {
  // Remove duplicates
  let filteredFolders = folders.filter((elem, index) => folders.indexOf(elem) === index);

  const foldersToBeRemoved: string[] = [];

  filteredFolders.forEach((folder, i) => {
    filteredFolders.forEach((subfolder, j) => {
      if (subfolder.includes(folder) && i !== j && !foldersToBeRemoved.includes(folder)) {
        foldersToBeRemoved.push(subfolder);
      }
    });
  });

  filteredFolders = filteredFolders.filter((elem) => !foldersToBeRemoved.includes(elem));

  return filteredFolders;
};

// TODO
export const getDefaultMetadata = (): Track => ({
  album: 'Unknown',
  artist: ['Unknown artist'],
  disk: {
    no: 0,
    of: 0,
  },
  duration: 0,
  genre: [],
  loweredMetas: {
    artist: ['unknown artist'],
    album: 'unknown',
    title: '',
    genre: [],
  },
  path: '',
  playCount: 0,
  title: '',
  track: {
    no: 0,
    of: 0,
  },
  year: null,
});

export const convertHMStoS = (timeString: string): number => {
  const arr = timeString.split(":");
  const seconds = parseInt(arr[0]) * 3600 + parseInt(arr[1]) * 60 + parseInt(arr[2]);

  return seconds;
}

const extractMetadataFromNative = (native: Record<string, Array<{id: string; value: string}>>): Partial<Track> => {
  const metadata: Record<string,string> = {};
  const regexList = [/album/gi, /artist/gi, /disk/gi, /duration/gi, /genre/gi, /title/gi, /year/gi];
  for (const nativeParser in native) {
    for (const field of native[nativeParser]) {
      for (const key of regexList) {
        if (field.value && key.test(field.id)) {
          metadata[key.source] = field.value;
          break;
        }
      }
    }
    break;
  }

  if (metadata.duration) {
    metadata.duration = convertHMStoS(metadata.duration).toString();
  }

  return pickBy(metadata);
} 

export const parseMusicMetadata = (data: mmd.IAudioMetadata, trackPath: string): Partial<Track> => {
  const { common, format, native } = data;
  const nativeMetadata = extractMetadataFromNative(native);

  const metadata = {
    album: common.album || nativeMetadata.album,
    artist: common.artists || 
      (common.artist && [common.artist]) ||
      (common.albumartist && [common.albumartist]) ||
      (nativeMetadata.artist && [nativeMetadata.artist]),
    disk: common.disk || nativeMetadata.disk,
    duration: format.duration || nativeMetadata.duration,
    genre: common.genre || (nativeMetadata.genre && [nativeMetadata.genre]),
    title: common.title || nativeMetadata.title || path.parse(trackPath).base,
    track: common.track || nativeMetadata.track,
    year: common.year || nativeMetadata.year,
  };

  return pickBy(metadata);
};

export const getLoweredMeta = (metadata: Track) => ({
  artist: metadata.artist.map((meta) => stripAccents(meta.toLowerCase())),
  album: stripAccents(metadata.album.toLowerCase()),
  title: stripAccents(metadata.title.toLowerCase()),
  genre: metadata.genre.map((meta) => stripAccents(meta.toLowerCase())),
});

export const getAudioDuration = (trackPath: string): Promise<number> => {
  const audio = new Audio();

  return new Promise((resolve, reject) => {
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
    });

    audio.addEventListener('error', (e) => {
      // eslint-disable-next-line
      // @ts-ignore error event typing is wrong
      const message = `Error getting audio duration: (${e.currentTarget.error.code}) ${trackPath}`;
      reject(new Error(message));
    });

    audio.preload = 'metadata';
    // HACK no idea what other caracters could fuck things up
    audio.src = encodeURI(trackPath).replace('#', '%23');
  });
};

/**
 * Get a file metadata
 */
export const getMetadata = async (trackPath: string): Promise<Track> => {
  const defaultMetadata = getDefaultMetadata();

  const basicMetadata: Track = {
    ...defaultMetadata,
    path: trackPath,
  };

  try {
    const data = await mmd.parseFile(trackPath, {
      skipCovers: true,
      duration: true,
    });

    // Let's try to define something with what we got so far...
    const parsedData = parseMusicMetadata(data, trackPath);

    const metadata: Track = {
      ...defaultMetadata,
      ...parsedData,
      path: trackPath,
    };

    metadata.loweredMetas = getLoweredMeta(metadata);

    // Let's try another wat to retrieve a track duration
    if (metadata.duration < 0.5) {
      try {
        metadata.duration = await getAudioDuration(trackPath);
      } catch (err) {
        console.warn(`An error occured while getting ${trackPath} duration: ${err}`);
      }
    }

    return metadata;
  } catch (err) {
    console.warn(`An error occured while reading ${trackPath} id3 tags: ${err}`);
  }

  return basicMetadata;
};
