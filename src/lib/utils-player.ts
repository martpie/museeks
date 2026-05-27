import type { Track } from '../generated/typings';

// Volume easing - http://www.dr-lex.be/info-stuff/volumecontrols.html#about
const SMOOTHING_FACTOR = 2.5;

/** Convert perceptual (linear slider) volume to audio gain. */
export const smoothifyVolume = (value: number): number =>
  value ** SMOOTHING_FACTOR;

/** Convert audio gain to perceptual (linear slider) volume. */
export const unsmoothifyVolume = (value: number): number =>
  value ** (1.0 / SMOOTHING_FACTOR);

/**
 * Shuffle an array with a Player behavior in mind:
 * the currently-playing track should remain the same,
 */
export function shuffleTracks(tracks: Track[], index: number): Track[] {
  const shuffledTracks = [...tracks];
  const currentTrack = shuffledTracks.splice(index, 1)[0];

  let m = shuffledTracks.length;
  let t: Track;
  let i: number;
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = shuffledTracks[m];
    shuffledTracks[m] = shuffledTracks[i];
    shuffledTracks[i] = t;
  }

  shuffledTracks.unshift(currentTrack);

  return [...shuffledTracks];
}
