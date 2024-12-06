import { getCurrentWindow } from '@tauri-apps/api/window';
import { useEffect } from 'react';

import { useNavigate } from '@tanstack/react-router';
import usePlayerStore from '../stores/usePlayerStore';

/**
 * Handle app-level IPC Navigation events
 */
function IPCNavigationEvents() {
  const navigate = useNavigate();
  const queueOrigin = usePlayerStore(
    (state) => state.queueOrigin ?? '/library',
  );

  useEffect(() => {
    function goToLibrary() {
      navigate({
        to: '/library',
      });
    }

    function goToPlaylists() {
      navigate({ to: '/playlists' });
    }

    function goToSettings() {
      navigate({ to: '/settings' });
    }

    function goToPlayingTrack() {
      // FIXME router
      // navigate(
      //   {
      //     pathname: queueOrigin,
      //     search: {
      //         "jump_to_playing_track": 'true',
      //       },
      //       replace: true
      //   },
      // );
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
  }, [navigate]);

  return null;
}

export default IPCNavigationEvents;
