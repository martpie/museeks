import { listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';

import type { IPCEvent, Track } from '../generated/typings';
import player from '../lib/player';

/**
 * Handle back-end events attempting to control the player
 */
function IPCPlayerEvents() {
  useEffect(() => {
    const unlistenerPromises = [
      listen('PlaybackPlay' satisfies IPCEvent, () => player.play()),
      listen('PlaybackPause' satisfies IPCEvent, () => player.pause()),
      listen('PlaybackPlayPause' satisfies IPCEvent, () => player.playPause()),
      listen('PlaybackPrevious' satisfies IPCEvent, () => player.previous()),
      listen('PlaybackNext' satisfies IPCEvent, () => player.next()),
      listen('PlaybackStop' satisfies IPCEvent, () => player.stop()),
      listen(
        'PlaybackStart' satisfies IPCEvent,
        ({ payload }: { payload: Track[] }) => {
          if (payload.length > 0) {
            player.start(payload, payload[0].id, { type: 'library' });
          }
        },
      ),
    ];

    return function cleanup() {
      Promise.all(unlistenerPromises).then((unlisteners) => {
        unlisteners.forEach((u) => {
          u();
        });
      });
    };
  }, []);

  return null;
}

export default IPCPlayerEvents;
