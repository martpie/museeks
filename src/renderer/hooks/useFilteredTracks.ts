import { useMemo } from 'react';

import { TrackModel } from '../../shared/types/museeks';
import { filterTracks, sortTracks } from '../lib/utils-library';
import SORT_ORDERS from '../constants/sort-orders';
import useLibraryStore from '../stores/useLibraryStore';

export default function useFilteredTracks(tracks: TrackModel[]): TrackModel[] {
  const { search, sort } = useLibraryStore((state) => ({ search: state.search, sort: state.sort }));

  // Filter and sort TracksList
  // sorting being a costly operation, do it after filtering
  const filteredTracks = useMemo(
    () => sortTracks(filterTracks(tracks, search), SORT_ORDERS[sort.by][sort.order]),
    [tracks, search, sort]
  );

  return filteredTracks;
}
