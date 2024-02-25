import orderBy from 'lodash/orderBy';

import { SortTuple } from '../constants/sort-orders';
import { TrackDoc } from '../generated/typings';

import * as utils from './utils';
import { stripAccents } from './utils-id3';

/**
 * Filter an array of tracks by string
 */
export const filterTracks = (
  tracks: TrackDoc[],
  search: string,
): TrackDoc[] => {
  // Avoid performing useless searches
  if (search.length === 0) return tracks;

  // Unoptimized, bad
  return tracks.filter(
    (track) =>
      stripAccents(track.doc.artists.toString().toLowerCase()).includes(
        search,
      ) ||
      stripAccents(track.doc.album.toLowerCase()).includes(search) ||
      stripAccents(track.doc.genres.toString().toLowerCase()).includes(
        search,
      ) ||
      stripAccents(track.doc.title.toLowerCase()).includes(search),
  );
};

/**
 * Sort an array of tracks (alias to lodash.orderby)
 */
export const sortTracks = (tracks: TrackDoc[], sort: SortTuple): TrackDoc[] => {
  const [columns, order] = sort;
  return orderBy<TrackDoc>(tracks, columns, order);
};

/**
 * Format a list of tracks to a nice status
 */
export const getStatus = (tracks: TrackDoc[]): string => {
  const status = utils.parseDuration(
    tracks.map((d) => d.doc.duration).reduce((a, b) => a + b, 0),
  );
  return `${tracks.length} tracks, ${status}`;
};
