import { useCallback } from 'react';
import Keybinding from 'react-keybinding-component';

import { useNavigate } from '@tanstack/react-router';
import { goToPlayingTrack } from '../lib/queue-origin';
import { isCtrlKey } from '../lib/utils-events';
import usePlayerStore from '../stores/usePlayerStore';

/**
 * Event Handlers for Navigation Events, triggered via IPC, typically, from
 * the application menu
 */
export default function IPCNavigationEvents() {
  const navigate = useNavigate();
  const queueOrigin = usePlayerStore((state) => state.queueOrigin);

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

  // On Windows, accelerators don't work https://github.com/tauri-apps/tauri/issues/6981
  // On Linux, accelerators don't work if the window menu is hidden
  // So we need to leverage a semi-global keybinding for those in the meantime ._.

  // Listen to IPC events for navigation
  // useEffect(() => {
  //   const unlisteners = [
  //     // Shortcuts from the application menu
  //     getCurrentWindow().listen('GoToLibrary', () => {
  //       goToLibrary();
  //     }),
  //     getCurrentWindow().listen('GoToPlaylists', goToPlaylists),
  //     getCurrentWindow().listen('GoToSettings', goToSettings),
  //     getCurrentWindow().listen('JumpToPlayingTrack', goToPlayingTrackOnEvent),
  //   ];

  //   return function cleanup() {
  //     Promise.all(unlisteners).then((unlisteners) => {
  //       unlisteners.forEach((u) => u());
  //     });
  //   };
  // }, [goToLibrary, goToPlaylists, goToSettings, goToPlayingTrackOnEvent]);

  const onKey = useCallback(
    async (e: KeyboardEvent) => {
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
