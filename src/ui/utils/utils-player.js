/**
 * Shuffle an array with a Player behavior in mind:
 * the currently-playing track should remain the same,
 *
 * @param {Array} tracks
 * @return {Array}
 */
export const shuffleTracks = (tracks, index) => {
  const currentTrack = tracks.splice(index, 1)[0];

  let m = tracks.length;
  let t;
  let i;
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = tracks[m];
    tracks[m] = tracks[i];
    tracks[i] = t;
  }

  tracks.unshift(currentTrack);

  return tracks;
};
