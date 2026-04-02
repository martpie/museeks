import ConfigBridge from './bridge-config';
import DatabaseBridge from './bridge-database';

export const allTracksQuery = {
  queryKey: ['all_tracks'],
  queryFn: () => DatabaseBridge.getAllTracks(),
  staleTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

export const configQuery = {
  queryKey: ['config'],
  queryFn: () => ConfigBridge.getAll(),
  initialData: window.__MUSEEKS_INITIAL_CONFIG,
  staleTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};
