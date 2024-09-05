import orderBy from 'lodash/orderBy';

import type { SortOrder, Track } from '../generated/typings';

import { parseDuration } from '../hooks/useFormattedDuration';
import type { SortConfig } from './sort-orders';

/**
 * Filter an array of tracks by string
 */
export function filterTracks(tracks: Track[], search: string): Track[] {
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
}

/**
 * Sort an array of tracks (alias to lodash.orderby)
 */
export function sortTracks(
  tracks: Track[],
  sortBy: SortConfig,
  sortOrder: SortOrder,
): Track[] {
  // The first column is sorted either asc or desc, but the rest is always asc
  const firstOrder = sortOrder === 'Asc' ? 'asc' : 'desc';
  return orderBy<Track>(tracks, sortBy, [firstOrder]);
}

/**
 * Format a list of tracks to a nice status
 */
export function getStatus(tracks: Track[]): string {
  const status = parseDuration(
    tracks.map((d) => d.duration).reduce((a, b) => a + b, 0),
  );
  return `${tracks.length} track${tracks.length !== 1 ? 's' : ''}, ${status}`;
}

/**
 * Strip accent from a string and lowercase them. From https://jsperf.com/strip-accents
 * Intentionally not idiomatic, it needs to be *fast*.
 */
export function stripAccents(str: string): string {
  let newStr = '';

  for (let i = 0; i < str.length; i++) {
    if (ACCENT_MAP.has(str[i])) {
      newStr += ACCENT_MAP.get(str[i]);
    } else {
      newStr += str[i];
    }
  }

  return newStr.toLowerCase();
}

const ACCENTS =
  'ÀÁÂÃÄÅĄĀàáâãäåąāÒÓÔÕÕÖØòóôõöøÈÉÊËĘĒèéêëðęēÇĆČçćčÐÌÍÎÏĪìíîïīÙÚÛÜŪùúûüūÑŅñņŠŚšśŸÿýŽŹŻžźżŁĻłļŃŅńņàáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîüûñçýỳỹỵỷğışĞİŞĢģĶķ';

const ACCENT_REPLACEMENTS =
  'AAAAAAAAaaaaaaaaOOOOOOOooooooEEEEEEeeeeeeeCCCcccDIIIIIiiiiiUUUUUuuuuuNNnnSSssYyyZZZzzzLLllNNnnaaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiuuncyyyyygisGISGgKk';

const ACCENT_MAP = new Map();

for (let i = 0; i < ACCENTS.length; i++) {
  ACCENT_MAP.set(ACCENTS[i], ACCENT_REPLACEMENTS[i]);
}
