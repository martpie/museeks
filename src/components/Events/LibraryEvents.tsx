import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';

import { useLibraryAPI } from '../../stores/useLibraryStore';
import { Progress } from '../../generated/typings';

/**
 * Handle Library-related app events, like refreshing and progress status
 */
function LibraryEvents() {
  const { setRefresh } = useLibraryAPI();

  useEffect(() => {
    const promise = listen<Progress>('LIBRARY_SCAN_PROGRESS', ({ payload }) => {
      setRefresh(payload.current, payload.total);
    });

    return () => {
      promise.then((unlisten) => unlisten());
    };
  }, [setRefresh]);

  return null;
}

export default LibraryEvents;
