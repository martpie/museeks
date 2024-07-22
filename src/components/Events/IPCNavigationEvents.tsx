import { getCurrentWindow } from '@tauri-apps/api/window';
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
  }, [navigate, playerAPI]);

  return null;
}

export default IPCNavigationEvents;
