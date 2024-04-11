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
      navigate('/library');
    }

    function goToPlayingTrack() {
      playerAPI.jumpToPlayingTrack();
    }

    // Shortcuts from the application menu
    const unlistenGoToLibrary = getCurrent().listen(
      'MENU_GO_TO_LIBRARY',
      goToLibrary,
    );
    const unlistenGoToPlaylists = getCurrent().listen(
      'MENU_GO_TO_PLAYLISTS',
      goToPlaylists,
    );
    const unlistenGoToPlayingTrack = getCurrent().listen(
      'MENU_JUMP_TO_PLAYING_TRACK',
      goToPlayingTrack,
    );

    return function cleanup() {
      unlistenGoToLibrary.then((u) => u());
      unlistenGoToPlaylists.then((u) => u());
      unlistenGoToPlayingTrack.then((u) => u());
    };
  }, [navigate, playerAPI]);

  return null;
}

export default IPCNavigationEvents;
