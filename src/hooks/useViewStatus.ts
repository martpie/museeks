import { useEffect } from 'react';

import type { Track, TrackGroup } from '../generated/typings';
import { getStatus } from '../lib/utils-library';
import { useLibraryAPI } from '../stores/useLibraryStore';
import useAllTracks from './useAllTracks';

/**
 * Update the footer status based on the given tracks
 */
export default function useViewStatus(tracks: Track[] | TrackGroup[]) {
  const libraryAPI = useLibraryAPI();
  const allTracks = useAllTracks(tracks);

  useEffect(() => {
    libraryAPI.setTracksStatus(getStatus(allTracks));

    return () => {
      libraryAPI.setTracksStatus(undefined);
    };
  }, [allTracks, libraryAPI.setTracksStatus]);
}
