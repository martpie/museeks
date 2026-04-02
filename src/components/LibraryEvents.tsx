import { listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';

import LibraryAPI from '../api/LibraryAPI';
import type { IPCEvent, ScanProgress } from '../generated/typings';

/**
 * Handle Library-related app events, like refreshing and progress status
 */
function LibraryEvents() {
  useEffect(() => {
    const promise = listen<ScanProgress>(
      'LibraryScanProgress' satisfies IPCEvent,
      ({ payload }) => {
        LibraryAPI.setRefresh(payload.current, payload.total);
      },
    );

    return () => {
      void promise.then((unlisten) => unlisten());
    };
  }, []);

  return null;
}

export default LibraryEvents;
