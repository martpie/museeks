import { useEffect, useMemo } from 'react';

import type { SortBy, SortOrder, Track } from '../generated/typings';
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
  sortBy?: SortBy,
  sortOrder?: SortOrder,
): Track[] {
  const search = useLibraryStore((state) => stripAccents(state.search));
  const libraryAPI = useLibraryAPI();

  const filteredTracks = useMemo(() => {
    let searchedTracks = filterTracks(tracks, search);

    if (sortBy && sortOrder) {
      // sorting being a costly operation, do it after filtering, ignore it if not needed
      searchedTracks = sortTracks(
        searchedTracks,
        getSortOrder(sortBy),
        sortOrder,
      );
    }

    return searchedTracks;
  }, [tracks, search, sortBy, sortOrder]);

  // Update the footer status based on the displayed tracks
  useEffect(() => {
    libraryAPI.setTracksStatus(filteredTracks);

    return () => {
      libraryAPI.setTracksStatus(null);
    };
  }, [filteredTracks, libraryAPI.setTracksStatus]);

  return filteredTracks;
}
