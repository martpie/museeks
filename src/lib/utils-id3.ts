import { TrackDoc } from '../generated/typings';
import { TrackSearchableFields } from '../types/museeks';

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
export const getLoweredMeta = (track: TrackDoc): TrackSearchableFields => ({
  artists: track.doc.artists.map((v) => stripAccents(v.toLowerCase())),
  album: stripAccents(track.doc.album.toLowerCase()),
  title: stripAccents(track.doc.title.toLowerCase()),
  genres: track.doc.genres.map((v) => stripAccents(v.toLowerCase())),
});
