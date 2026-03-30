import ConfigBridge from './bridge-config';
import DatabaseBridge from './bridge-database';

export const allTracksQuery = {
  queryKey: ['all_tracks'],
  queryFn: () => DatabaseBridge.getAllTracks(),
  staleTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

export const librarySortQuery = {
  queryKey: ['library_sort'],
  queryFn: async () => {
    const [sortBy, sortOrder] = await Promise.all([
      ConfigBridge.get('library_sort_by'),
      ConfigBridge.get('library_sort_order'),
    ]);

    return {
      sortBy,
      sortOrder,
    };
  },
  staleTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};
