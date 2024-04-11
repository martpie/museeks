import type { Track } from '../generated/typings';
import type { TrackSearchableFields } from '../types/museeks';

const ACCENTS =
  'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
const ACCENT_REPLACEMENTS =
  'AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz';

/**
 * Strip accent from String. From https://jsperf.com/strip-accents
 */
export const stripAccents = (str: string): string => {
  const split = ACCENTS.split('').join('|');
  const reg = new RegExp(`(${split})`, 'g');

  function replacement(a: string) {
    return ACCENT_REPLACEMENTS[ACCENTS.indexOf(a)] || '';
  }

  return str.replace(reg, replacement).toLowerCase();
};

/**
 * Take a track a returns its lowered metadata (used for search)
 */
export const getLoweredMeta = (track: Track): TrackSearchableFields => ({
  artists: track.artists.map((v) => stripAccents(v.toLowerCase())),
  album: stripAccents(track.album.toLowerCase()),
  title: stripAccents(track.title.toLowerCase()),
  genres: track.genres.map((v) => stripAccents(v.toLowerCase())),
});
