import { useEffect, useMemo } from 'react';

import type { Track, TrackGroup } from '../generated/typings';
import { useLibraryAPI } from '../stores/useLibraryStore';
import type { TrackListStatusInfo } from '../types/museeks';
import useAllTracks from './useAllTracks';

/**
 * Update the footer status based on the given tracks
 */
export default function useGlobalTrackListStatus(
  tracks: Track[] | TrackGroup[],
) {
  const libraryAPI = useLibraryAPI();
  const info = useTrackListStatus(tracks);

  useEffect(() => {
    libraryAPI.setTracksStatus(info);

    return () => {
      libraryAPI.setTracksStatus(undefined);
    };
  }, [info, libraryAPI.setTracksStatus]);
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
    const duration = allTracks.reduce((sum, d) => sum + d.duration, 0);

    return {
      count: allTracks.length,
      duration,
    };
  }, [allTracks]);
}
