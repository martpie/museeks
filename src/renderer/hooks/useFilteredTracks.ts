import { useSelector } from 'react-redux';
import { useMemo } from 'react';

import { TrackModel } from '../../shared/types/museeks';
import { filterTracks, sortTracks } from '../lib/utils-library';
import { RootState } from '../store/reducers';
import SORT_ORDERS from '../constants/sort-orders';

export default function useFilteredTracks(tracks: TrackModel[]): TrackModel[] {
  const { search, sort } = useSelector((state: RootState) => {
    const { search, sort } = state.library;
    return { search, sort };
  });

  // Filter and sort TracksList
  // sorting being a costly operation, do it after filtering
  const filteredTracks = useMemo(
    () => sortTracks(filterTracks(tracks, search), SORT_ORDERS[sort.by][sort.order]),
    [tracks, search, sort]
  );

  return filteredTracks;
}
