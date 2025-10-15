import { useEffect } from 'react';

import { usePlayerAPI } from '../stores/usePlayerStore';

/**
 * Wire MediaSession action handlers to player API.
 * Note: MediaSession state sync (metadata, playback state) is handled
 * directly in player.ts
 */
function MediaSessionEvents() {
  const playerAPI = usePlayerAPI();

  useEffect(() => {
    // If no MediaSession support, do nothing
    if (
      !('mediaSession' in navigator) ||
      typeof navigator.mediaSession !== 'object'
    ) {
      return;
    }

    // Set up action handlers for OS-level media controls
    navigator.mediaSession.setActionHandler('play', () => playerAPI.play());
    navigator.mediaSession.setActionHandler('pause', () => playerAPI.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () =>
      playerAPI.previous(),
    );
    navigator.mediaSession.setActionHandler('nexttrack', () =>
      playerAPI.next(),
    );

    return function cleanup() {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
    };
  }, [playerAPI]);

  return null;
}

export default MediaSessionEvents;
