import { create } from 'zustand';

import type { TrackListStatusInfo } from '../types/museeks';

type LibraryState = {
  search: string;
  refreshing: boolean;
  refresh: {
    current: number;
    total: number;
  };
  tracksStatus: TrackListStatusInfo | null;
};

const useLibraryStore = create<LibraryState>()(() => ({
  search: '',
  refreshing: false,
  refresh: {
    current: 0,
    total: 0,
  },
  tracksStatus: null,
}));

export default useLibraryStore;
