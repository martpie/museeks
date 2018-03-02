import utils from './utils';

/**
 * Filter an array of track by value
 *
 * @param {array} tracks
 * @param {string} search
 */
export const filterTracks = (tracks, search) => {
  return tracks.filter((track) => {
    return track.loweredMetas.artist.join(', ').includes(search)
      || track.loweredMetas.album.includes(search)
      || track.loweredMetas.genre.join(', ').includes(search)
      || track.loweredMetas.title.includes(search);
  });
};

/**
 * Format a list of tracks to a nice status
 *
 * @param {array} tracks
 * @return string
 */
export const getStatus = (tracks) => {
  const status = utils.parseDuration(tracks.map((d) => d.duration).reduce((a, b) => a + b, 0));
  return `${tracks.length} tracks, ${status}`;
};
