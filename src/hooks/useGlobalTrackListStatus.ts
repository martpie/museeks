import { useEffect, useMemo } from 'react';

import type { Track, TrackGroup } from '../generated/typings';
import { useLibraryAPI } from '../stores/useLibraryStore';
import type { TrackListStatusInfo } from '../types/museeks';
import useAllTracks from './useAllTracks';

/**
 * Update the footer status based on the given tracks
 */
export default function useGlobalTrackListStatus(
  tracks: Array<Track> | Array<TrackGroup>,
) {
  const libraryAPI = useLibraryAPI();
  const info = useTrackListStatus(tracks);

  useEffect(() => {
    libraryAPI.setTracksStatus(info);

    return () => {
      libraryAPI.setTracksStatus(undefined);
    };
  }, [info, libraryAPI]);
}

/**
 * Same as above, but local. Returns the info, without modifying the
 * footer status.
 */
export function useTrackListStatus(
  tracks: Array<Track> | Array<TrackGroup>,
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
