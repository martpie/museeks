import { TrackModel } from '../../shared/types/interfaces';

/**
 * Shuffle an array with a Player behavior in mind:
 * the currently-playing track should remain the same,
 */
export const shuffleTracks = (tracks: TrackModel[], index: number): TrackModel[] => {
  const shuffledTracks = [...tracks];
  const currentTrack = shuffledTracks.splice(index, 1)[0];

  let m = shuffledTracks.length;
  let t;
  let i;
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = shuffledTracks[m];
    shuffledTracks[m] = shuffledTracks[i];
    shuffledTracks[i] = t;
  }

  shuffledTracks.unshift(currentTrack);

  return shuffledTracks;
};
