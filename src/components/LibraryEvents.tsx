import { listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';

import type { IPCEvent, ScanProgress } from '../generated/typings';
import { useLibraryAPI } from '../stores/useLibraryStore';

/**
 * Handle Library-related app events, like refreshing and progress status
 */
function LibraryEvents() {
  const { setRefresh } = useLibraryAPI();

  useEffect(() => {
    const promise = listen<ScanProgress>(
      'LibraryScanProgress' satisfies IPCEvent,
      ({ payload }) => {
        setRefresh(payload.current, payload.total);
      },
    );

    return () => {
      promise.then((unlisten) => unlisten());
    };
  }, [setRefresh]);

  return null;
}

export default LibraryEvents;
