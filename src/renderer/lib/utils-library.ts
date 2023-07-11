import orderBy from 'lodash/orderBy';

import { TrackModel } from '../../shared/types/museeks';
import { SortTuple } from '../constants/sort-orders';

import * as utils from './utils';

/**
 * Filter an array of tracks by string
 */
export const filterTracks = (
  tracks: TrackModel[],
  search: string,
): TrackModel[] => {
  // Avoid performing useless searches
  if (search.length === 0) return tracks;

  return tracks.filter(
    (track) =>
      track.loweredMetas.artist.toString().includes(search) ||
      track.loweredMetas.album.includes(search) ||
      track.loweredMetas.genre.toString().includes(search) ||
      track.loweredMetas.title.includes(search),
  );
};

/**
 * Sort an array of tracks (alias to lodash.orderby)
 */
export const sortTracks = (
  tracks: TrackModel[],
  sort: SortTuple,
): TrackModel[] => {
  const [columns, order] = sort;
  return orderBy<TrackModel>(tracks, columns, order);
};

/**
 * Format a list of tracks to a nice status
 */
export const getStatus = (tracks: TrackModel[]): string => {
  const status = utils.parseDuration(
    tracks.map((d) => d.duration).reduce((a, b) => a + b, 0),
  );
  return `${tracks.length} tracks, ${status}`;
};
