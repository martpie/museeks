import { getCurrentWindow } from '@tauri-apps/api/window';
import { useEffect } from 'react';

import { useNavigate } from '@tanstack/react-router';
import { goToPlayingTrack } from '../lib/queue-origin';
import usePlayerStore from '../stores/usePlayerStore';

/**
 * Handle app-level IPC Navigation events
 */
export default function IPCNavigationEvents() {
  const navigate = useNavigate();
  const queueOrigin = usePlayerStore((state) => state.queueOrigin);

  useEffect(() => {
    function goToLibrary() {
      navigate({ to: '/library' });
    }

    function goToPlaylists() {
      navigate({ to: '/playlists' });
    }

    function goToSettings() {
      navigate({ to: '/settings' });
    }

    function goToPlayingTrackOnEvent() {
      goToPlayingTrack(queueOrigin, navigate);
    }

    const unlisteners = [
      // Shortcuts from the application menu
      getCurrentWindow().listen('GoToLibrary', goToLibrary),
      getCurrentWindow().listen('GoToPlaylists', goToPlaylists),
      getCurrentWindow().listen('GoToSettings', goToSettings),
      getCurrentWindow().listen('JumpToPlayingTrack', goToPlayingTrackOnEvent),
    ];

    return function cleanup() {
      Promise.all(unlisteners).then((unlisteners) => {
        unlisteners.forEach((u) => u());
      });
    };
  }, [navigate, queueOrigin]);

  return null;
}
