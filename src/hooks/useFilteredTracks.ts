import { useMemo } from 'react';

import type { Track } from '../generated/typings';
import SORT_ORDERS from '../lib/sort-orders';
import { filterTracks, sortTracks, stripAccents } from '../lib/utils-library';
import useLibraryStore from '../stores/useLibraryStore';

export default function useFilteredTracks(tracks: Track[]): Track[] {
  const search = useLibraryStore((state) => stripAccents(state.search));
  const sortBy = useLibraryStore((state) => state.sortBy);
  const sortOrder = useLibraryStore((state) => state.sortOrder);

  // Filter and sort TracksList
  // sorting being a costly operation, do it after filtering, but we still cache
  // search results.

  const searchedTracks = useMemo(
    () => filterTracks(tracks, search),
    [tracks, search],
  );

  const sortedTracks = useMemo(
    () => sortTracks(searchedTracks, SORT_ORDERS[sortBy], sortOrder),
    [searchedTracks, sortBy, sortOrder],
  );

  return sortedTracks;
}
