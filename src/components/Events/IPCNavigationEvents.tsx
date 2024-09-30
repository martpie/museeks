import { getCurrentWindow } from '@tauri-apps/api/window';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import useLibraryStore from '../../stores/useLibraryStore';
import usePlayerStore from '../../stores/usePlayerStore';

/**
 * Handle app-level IPC Navigation events
 */
function IPCNavigationEvents() {
  const navigate = useNavigate();
  const queueOrigin = usePlayerStore(
    (state) => state.queueOrigin ?? '#/library',
  );

  useEffect(() => {
    function goToLibrary() {
      navigate('/library');
    }

    function goToPlaylists() {
      navigate('/playlists');
    }

    function goToSettings() {
      navigate('/settings');
    }

    function goToPlayingTrack() {
      navigate(queueOrigin);

      setTimeout(() => {
        useLibraryStore.getState().api.highlightPlayingTrack(true);
      }, 0);
    }

    const unlisteners = [
      // Shortcuts from the application menu
      getCurrentWindow().listen('GoToLibrary', goToLibrary),
      getCurrentWindow().listen('GoToPlaylists', goToPlaylists),
      getCurrentWindow().listen('GoToSettings', goToSettings),
      getCurrentWindow().listen('JumpToPlayingTrack', goToPlayingTrack),
    ];

    return function cleanup() {
      Promise.all(unlisteners).then((unlisteners) => {
        unlisteners.forEach((u) => u());
      });
    };
  }, [navigate, queueOrigin]);

  return null;
}

export default IPCNavigationEvents;
