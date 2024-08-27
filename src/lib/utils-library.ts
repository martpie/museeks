import orderBy from 'lodash/orderBy';

import type { Track } from '../generated/typings';

import { parseDuration } from '../hooks/useFormattedDuration';
import type { SortTuple } from './sort-orders';

/**
 * Filter an array of tracks by string
 */
export const filterTracks = (tracks: Track[], search: string): Track[] => {
  // Avoid performing useless searches
  if (search.length === 0) return tracks;

  // Unoptimized, bad
  return tracks.filter(
    (track) =>
      stripAccents(track.artists.toString().toLowerCase()).includes(search) ||
      stripAccents(track.album.toLowerCase()).includes(search) ||
      stripAccents(track.genres.toString().toLowerCase()).includes(search) ||
      stripAccents(track.title.toLowerCase()).includes(search),
  );
};

/**
 * Sort an array of tracks (alias to lodash.orderby)
 */
export const sortTracks = (tracks: Track[], sort: SortTuple): Track[] => {
  const [columns, order] = sort;
  return orderBy<Track>(tracks, columns, order);
};

/**
 * Format a list of tracks to a nice status
 */
export const getStatus = (tracks: Track[]): string => {
  const status = parseDuration(
    tracks.map((d) => d.duration).reduce((a, b) => a + b, 0),
  );
  return `${tracks.length} track${tracks.length !== 1 ? 's' : ''}, ${status}`;
};

/**
 * Strip accent from a string and lowercase them. From https://jsperf.com/strip-accents
 * Eventually, replace this by node-diacriticatics or something, but should be good enough for now
 */
export const stripAccents = (str: string): string => {
  const split = ACCENTS.split('').join('|');
  const reg = new RegExp(`(${split})`, 'g');

  function replacement(a: string) {
    return ACCENT_REPLACEMENTS[ACCENTS.indexOf(a)] || '';
  }

  return str.replace(reg, replacement).toLowerCase();
};

const ACCENTS =
  'ÀÁÂÃÄÅĄĀàáâãäåąāÒÓÔÕÕÖØòóôõöøÈÉÊËĘĒèéêëðęēÇĆČçćčÐÌÍÎÏĪìíîïīÙÚÛÜŪùúûüūÑŅñņŠŚšśŸÿýŽŹŻžźżŁĻłļŃŅńņàáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîüûñçýỳỹỵỷğışĞİŞĢģĶķ';
const ACCENT_REPLACEMENTS =
  'AAAAAAAAaaaaaaaaOOOOOOOooooooEEEEEEeeeeeeeCCCcccDIIIIIiiiiiUUUUUuuuuuNNnnSSssYyyZZZzzzLLllNNnnaaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiuuncyyyyygisGISGgKk';
