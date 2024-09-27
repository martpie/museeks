import { useEffect, useMemo } from 'react';

import type { Track } from '../generated/typings';
import {
  filterTracks,
  getSortOrder,
  sortTracks,
  stripAccents,
} from '../lib/utils-library';
import useLibraryStore, { useLibraryAPI } from '../stores/useLibraryStore';

/**
 * Filter and Sort a list of tracks depending on the user preferences and search
 * IMPORTANT: can only be used ONCE per view, as it has side effects
 */
export default function useFilteredTracks(
  tracks: Track[],
  enableSort = true,
): Track[] {
  const search = useLibraryStore((state) => stripAccents(state.search));
  const sortBy = useLibraryStore((state) => state.sortBy);
  const sortOrder = useLibraryStore((state) => state.sortOrder);
  const libraryAPI = useLibraryAPI();

  const filteredTracks = useMemo(() => {
    let searchedTracks = filterTracks(tracks, search);

    if (enableSort) {
      // sorting being a costly operation, do it after filtering, ignore it if not needed
      searchedTracks = sortTracks(
        searchedTracks,
        getSortOrder(sortBy),
        sortOrder,
      );
    }

    return searchedTracks;
  }, [tracks, search, sortBy, sortOrder, enableSort]);

  // Update the footer status based on the displayed tracks
  useEffect(() => {
    libraryAPI.setTracksStatus(filteredTracks);

    return () => {
      libraryAPI.setTracksStatus(null);
    };
  }, [filteredTracks, libraryAPI.setTracksStatus]);

  return filteredTracks;
}
