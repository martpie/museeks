import orderBy from 'lodash-es/orderBy';
import uniq from 'lodash-es/uniq';

import type { SortBy, SortOrder, Track } from '../generated/typings';
import { parseDuration } from '../hooks/useFormattedDuration';
import type { Path } from '../types/syncudio';
import { plural } from './localization';

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
  const duration = parseDuration(
    tracks.map((d) => d.duration).reduce((a, b) => a + b, 0),
  );
  return `${tracks.length} ${plural('track', tracks.length)}, ${duration}`;
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

/**
 * Given multiple paths as string, remove duplicates or child paths in case on parent exist in the array
 */
export const removeRedundantFolders = (paths: Array<string>): Array<string> => {
  return uniq(
    paths.filter((path) => {
      const isDuplicate = paths.some((otherPath) => {
        return path.startsWith(otherPath) && path !== otherPath;
      });

      return !isDuplicate;
    }),
  );
};

/** ----------------------------------------------------------------------------
 * Sort utilities
 * -------------------------------------------------------------------------- */

// For perforances reasons, otherwise _.orderBy will perform weird checks
// that are far more resource/time impactful
const ARTIST = (t: Track): string =>
  stripAccents(t.artists.toString().toLowerCase());
const GENRE = (t: Track): string =>
  stripAccents(t.genres.toString().toLowerCase());
const ALBUM = (t: Track): string => stripAccents(t.album.toLowerCase());
const TITLE = (t: Track): string => stripAccents(t.title.toLowerCase());

type TrackKeys = Path<Track>;
type IterateeFunction = (track: Track) => string;

export type SortConfig = Array<TrackKeys | IterateeFunction>;

// Declarations
const SORT_ORDERS: Record<SortBy, SortConfig> = {
  Artist: [ARTIST, ALBUM, 'disk_no', 'track_no'],
  Title: [TITLE, ARTIST, ALBUM, 'disk_no', 'track_no'],
  Duration: ['duration', ARTIST, ALBUM, 'disk_no', 'track_no'],
  Album: [ALBUM, ARTIST, 'disk_no', 'track_no'],
  Genre: [GENRE, ARTIST, ALBUM, 'disk_no', 'track_no'],
};

export function getSortOrder(sortBy: SortBy): SortConfig {
  return SORT_ORDERS[sortBy];
}
