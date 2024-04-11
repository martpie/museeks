import orderBy from 'lodash/orderBy';

import type { Track } from '../generated/typings';

import type { SortTuple } from './sort-orders';
import * as utils from './utils';
import { stripAccents } from './utils-id3';

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
  const status = utils.parseDuration(
    tracks.map((d) => d.duration).reduce((a, b) => a + b, 0),
  );
  return `${tracks.length} tracks, ${status}`;
};
