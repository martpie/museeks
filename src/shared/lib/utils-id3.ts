import { Track, TrackEditableFields } from '../types/museeks';

/**
 * Strip accent from String. From https://jsperf.com/strip-accents
 */
export const stripAccents = (str: string): string => {
  const accents =
    'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
  const fixes =
    'AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz';
  const split = accents.split('').join('|');
  const reg = new RegExp(`(${split})`, 'g');

  function replacement(a: string) {
    return fixes[accents.indexOf(a)] || '';
  }

  return str.replace(reg, replacement).toLowerCase();
};

/**
 * Take a track a returns its lowered metadata (used for search)
 */
export const getLoweredMeta = (
  metadata: TrackEditableFields,
): Track['loweredMetas'] => ({
  artist: metadata.artist.map((meta) => stripAccents(meta.toLowerCase())),
  album: stripAccents(metadata.album.toLowerCase()),
  title: stripAccents(metadata.title.toLowerCase()),
  genre: metadata.genre.map((meta) => stripAccents(meta.toLowerCase())),
});
