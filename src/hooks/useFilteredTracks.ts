import { useMemo } from 'react';

import { filterTracks, sortTracks } from '../lib/utils-library';
import SORT_ORDERS from '../lib/sort-orders';
import useLibraryStore from '../stores/useLibraryStore';
import { Track } from '../generated/typings';
import { stripAccents } from '../lib/utils-id3';

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
