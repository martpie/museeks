import type { Track } from '../generated/typings';

/**
 * Shuffle an array with a Player behavior in mind:
 * the currently-playing track should remain the same,
 */
export function shuffleTracks(tracks: Array<Track>, index: number): Array<Track> {
  const shuffledTracks = [...tracks];
  const currentTrack = shuffledTracks.splice(index, 1)[0];

  let m = shuffledTracks.length;

  while (m) {
    // Pick a remaining element…
    let i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    let t = shuffledTracks[m];
    shuffledTracks[m] = shuffledTracks[i];
    shuffledTracks[i] = t;
  }

  shuffledTracks.unshift(currentTrack);

  return [...shuffledTracks];
}
