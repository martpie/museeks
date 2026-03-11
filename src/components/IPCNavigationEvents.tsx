import { useNavigate } from '@tanstack/react-router';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useEffect } from 'react';
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
  const goToLibrary = () => {
    void navigate({ to: '/library' });
  };

  const goToPlaylists = () => {
    void navigate({ to: '/playlists' });
  };

  const goToSettings = () => {
    void navigate({ to: '/settings/library' });
  };

  const goToPlayingTrackOnEvent = () => {
    goToPlayingTrack(queueOrigin, navigate);
  };

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
      void Promise.all(unlistenerPromises).then((unlisteners) => {
        unlisteners.forEach((unlisten) => {
          unlisten();
        });
      });
    };
  }, [goToLibrary, goToPlaylists, goToSettings, goToPlayingTrackOnEvent]);

  // On Windows, accelerators don't work https://github.com/tauri-apps/tauri/issues/6981
  // On Linux, accelerators don't work if the window menu is hidden
  // So we need to leverage a semi-global keybinding for those in the meantime ._.
  const onKey = async (e: KeyboardEvent) => {
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
  };

  return <Keybinding onKey={onKey} preventInputConflict />;
}
