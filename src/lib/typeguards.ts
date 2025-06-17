import type { Track, TrackGroup } from '../generated/typings';

export function isTracksArray(array: Array<Track> | Array<TrackGroup>): array is Array<Track> {
  return array.length === 0 || 'id' in array[0];
}
