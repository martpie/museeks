import type { Track, TrackGroup } from '../generated/typings';

export function isTracksArray(array: Track[] | TrackGroup[]): array is Track[] {
  return array.length === 0 || 'id' in array[0];
}
