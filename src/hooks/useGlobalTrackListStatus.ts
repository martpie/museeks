import { useEffect, useMemo } from 'react';

import LibraryAPI from '../api/LibraryAPI';
import type { Track, TrackGroup } from '../generated/typings';
import type { TrackListStatusInfo } from '../types/museeks';
import useAllTracks from './useAllTracks';

/**
 * Update the footer status based on the given tracks
 */
export default function useGlobalTrackListStatus(
  tracks: Track[] | TrackGroup[],
) {
  const info = useTrackListStatus(tracks);

  useEffect(() => {
    LibraryAPI.setTracksStatus(info);

    return () => {
      LibraryAPI.setTracksStatus(undefined);
    };
  }, [info]);
}

/**
 * Same as above, but local. Returns the info, without modifying the
 * footer status.
 */
export function useTrackListStatus(
  tracks: Track[] | TrackGroup[],
): TrackListStatusInfo {
  const allTracks = useAllTracks(tracks);

  return useMemo(() => {
    const duration = allTracks
      .map((d) => d.duration)
      .reduce((a, b) => a + b, 0);

    return {
      count: allTracks.length,
      duration,
    };
  }, [allTracks]);
}
