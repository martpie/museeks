import { useMemo } from 'react';

import type { Track, TrackGroup } from '../generated/typings';
import { isTracksArray } from '../lib/typeguards';

/**
 * Given a list of tracks or tracks groups, return all tracks, flat.
 */
export default function useAllTracks(tracks: Track[] | TrackGroup[]) {
  return useMemo(() => {
    if (isTracksArray(tracks)) {
      return tracks;
    }

    return tracks.flatMap((group) => group.tracks);
  }, [tracks]);
}
