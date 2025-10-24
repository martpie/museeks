import { useNavigate } from '@tanstack/react-router';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useCallback, useEffect } from 'react';
import Keybinding from 'react-keybinding-component';

import { usePlayerState } from '../hooks/usePlayer';
import { goToPlayingTrack } from '../lib/queue-origin';
import { isCtrlKey } from '../lib/utils-events';

/**
 * Event Handlers for Navigation Events, triggered via IPC, typically, from
 * the application menu
 */
export default function IPCNavigationEvents() {
  const navigate = useNavigate();
  const queueOrigin = usePlayerState((state) => state.queueOrigin);

  // Navigation handlers
  const goToLibrary = useCallback(() => {
    navigate({ to: '/library' });
  }, [navigate]);

  const goToPlaylists = useCallback(() => {
    navigate({ to: '/playlists' });
  }, [navigate]);

  const goToSettings = useCallback(() => {
    navigate({ to: '/settings/library' });
  }, [navigate]);

  const goToPlayingTrackOnEvent = useCallback(() => {
    goToPlayingTrack(queueOrigin, navigate);
  }, [queueOrigin, navigate]);

  // Listen to IPC events for navigation
  useEffect(() => {
    const unlistenerPromises = [
      // Shortcuts from the application menu
      getCurrentWindow().listen('GoToLibrary', () => {
        goToLibrary();
      }),
      getCurrentWindow().listen('GoToPlaylists', goToPlaylists),
      getCurrentWindow().listen('GoToSettings', goToSettings),
      getCurrentWindow().listen('JumpToPlayingTrack', goToPlayingTrackOnEvent),
    ];

    return function cleanup() {
      Promise.all(unlistenerPromises).then((unlisteners) => {
        unlisteners.forEach((u) => {
          u();
        });
      });
    };
  }, [goToLibrary, goToPlaylists, goToSettings, goToPlayingTrackOnEvent]);

  // On Windows, accelerators don't work https://github.com/tauri-apps/tauri/issues/6981
  // On Linux, accelerators don't work if the window menu is hidden
  // So we need to leverage a semi-global keybinding for those in the meantime ._.
  const onKey = useCallback(
    async (e: KeyboardEvent) => {
      // Prevent double navigation for cases we know work well
      if (window.__MUSEEKS_PLATFORM === 'macos') {
        return;
      }

      if (!isCtrlKey(e)) {
        return;
      }

      switch (e.key) {
        case 'l': {
          goToLibrary();
          break;
        }
        case 'p': {
          goToPlaylists();
          break;
        }
        case ',': {
          goToSettings();
          break;
        }
        case 't': {
          goToPlayingTrackOnEvent();
          break;
        }
      }

      switch (e.key) {
        default:
          break;
      }
    },
    [goToLibrary, goToPlaylists, goToSettings, goToPlayingTrackOnEvent],
  );

  return <Keybinding onKey={onKey} preventInputConflict />;
}
