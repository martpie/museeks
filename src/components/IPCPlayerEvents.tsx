import { listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';

import type { IPCEvent, Track } from '../generated/typings';
import { usePlayerAPI } from '../stores/usePlayerStore';

/**
 * Handle back-end events attempting to control the player
 */
function IPCPlayerEvents() {
  const playerAPI = usePlayerAPI();

  useEffect(() => {
    const unlisteners = [
      listen('PlaybackPlay' satisfies IPCEvent, playerAPI.play),
      listen('PlaybackPause' satisfies IPCEvent, playerAPI.pause),
      listen('PlaybackPlayPause' satisfies IPCEvent, playerAPI.playPause),
      listen('PlaybackPrevious' satisfies IPCEvent, playerAPI.previous),
      listen('PlaybackNext' satisfies IPCEvent, playerAPI.next),
      listen('PlaybackStop' satisfies IPCEvent, playerAPI.stop),
      listen(
        'PlaybackStart' satisfies IPCEvent,
        ({ payload }: { payload: Track[] }) => playerAPI.start(payload),
      ),
    ];

    return function cleanup() {
      Promise.all(unlisteners).then((unlisteners) => {
        unlisteners.forEach((u) => u());
      });
    };
  }, [playerAPI]);

  return null;
}

export default IPCPlayerEvents;
