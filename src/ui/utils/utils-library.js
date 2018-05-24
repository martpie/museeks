import orderBy from 'lodash/orderBy';
import * as utils from './utils';

/**
 * Filter an array of tracks
 *
 * @param {array} tracks
 * @param {string} search
 */
export const filterTracks = (tracks, search) => tracks.filter(track => track.loweredMetas.artist.toString().includes(search)
      || track.loweredMetas.album.includes(search)
      || track.loweredMetas.genre.toString().includes(search)
      || track.loweredMetas.title.includes(search));

/**
 * Sort an array of tracks (simple alias to lodash.orderby)
 * @param {array} tracks
 * @param {array} sort
 * @return {array}
 */
export const sortTracks = (tracks, sort) => orderBy(tracks, ...sort);


/**
 * Format a list of tracks to a nice status
 *
 * @param {array} tracks
 * @return string
 */
export const getStatus = (tracks) => {
  const status = utils.parseDuration(tracks.map(d => d.duration).reduce((a, b) => a + b, 0));
  return `${tracks.length} tracks, ${status}`;
};
