import { getCurrent } from '@tauri-apps/api/window';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePlayerAPI } from '../../stores/usePlayerStore';

/**
 * Handle app-level IPC Navigation events
 */
function IPCNavigationEvents() {
  const navigate = useNavigate();
  const playerAPI = usePlayerAPI();

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
      playerAPI.jumpToPlayingTrack();
    }

    const unlisteners = [
      // Shortcuts from the application menu
      getCurrent().listen('GoToLibrary', goToLibrary),
      getCurrent().listen('GoToPlaylists', goToPlaylists),
      getCurrent().listen('GoToSettings', goToSettings),
      getCurrent().listen('JumpToPlayingTrack', goToPlayingTrack),
    ];

    return function cleanup() {
      Promise.all(unlisteners).then((unlisteners) => {
        unlisteners.forEach((u) => u());
      });
    };
  }, [navigate, playerAPI]);

  return null;
}

export default IPCNavigationEvents;
