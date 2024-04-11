import { useMemo } from 'react';

import type { Track } from '../generated/typings';
import SORT_ORDERS from '../lib/sort-orders';
import { stripAccents } from '../lib/utils-id3';
import { filterTracks, sortTracks } from '../lib/utils-library';
import useLibraryStore from '../stores/useLibraryStore';

export default function useFilteredTracks(tracks: Track[]): Track[] {
  const search = useLibraryStore((state) => stripAccents(state.search));
  const sortBy = useLibraryStore((state) => state.sortBy);
  const sortOrder = useLibraryStore((state) => state.sortOrder);

  // Filter and sort TracksList
  // sorting being a costly operation, do it after filtering
  const filteredTracks = useMemo(
    () =>
      sortTracks(filterTracks(tracks, search), SORT_ORDERS[sortBy][sortOrder]),
    [tracks, search, sortBy, sortOrder],
  );

  return filteredTracks;
}
