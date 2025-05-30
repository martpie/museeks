import { getCurrentWindow } from '@tauri-apps/api/window';
import { useEffect } from 'react';

import { useNavigate } from '@tanstack/react-router';
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

    function goToPlayingTrack() {
      if (!queueOrigin) return;

      switch (queueOrigin.type) {
        case 'library': {
          navigate({
            to: '/library',
            replace: true, // Force rerendering to activate the scroll
            search: {
              jump_to_playing_track: true,
            },
          });
          break;
        }
        case 'playlist': {
          navigate({
            to: '/playlists/$playlistID',
            params: { playlistID: queueOrigin.playlistID },
            replace: true, // Force rerendering to activate the scroll
            search: {
              jump_to_playing_track: true,
            },
          });
          break;
        }
        case 'artist': {
          navigate({
            to: '/artists/$artistID',
            params: { artistID: queueOrigin.artistID },
            replace: true,
            search: {
              jump_to_playing_track: true,
            },
          });
        }
      }
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
