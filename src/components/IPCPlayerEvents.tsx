import { listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';

import type { IPCEvent, Repeat, Track } from '../generated/typings';
import player from '../lib/player';
import { smoothifyVolume } from '../lib/utils-player';

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
        async ({ payload }: { payload: Track[] }) => {
          if (payload.length > 0) {
            await player.start(payload, payload[0].id, { type: 'library' });
          }
        },
      ),
      listen(
        'PlaybackSeekTo' satisfies IPCEvent,
        ({ payload }: { payload: number }) => {
          player.setCurrentTime(payload);
        },
      ),
      listen(
        'PlaybackSeekBy' satisfies IPCEvent,
        ({ payload }: { payload: number }) => {
          player.setCurrentTime(player.getCurrentTime() + payload);
        },
      ),
      listen(
        'PlaybackSetVolume' satisfies IPCEvent,
        ({ payload }: { payload: number }) => {
          // Convert from perceptual MPRIS volume to audio gain (smoothed)
          player.setVolume(smoothifyVolume(payload));
        },
      ),
      listen(
        'PlaybackSetShuffle' satisfies IPCEvent,
        ({ payload }: { payload: boolean }) => {
          void player.setShuffle(payload);
        },
      ),
      listen(
        'PlaybackSetRepeat' satisfies IPCEvent,
        ({ payload }: { payload: Repeat }) => {
          void player.setRepeat(payload);
        },
      ),
    ];

    return function cleanup() {
      void Promise.all(unlistenerPromises).then((unlisteners) => {
        unlisteners.forEach((unlisten) => {
          unlisten();
        });
      });
    };
  }, []);

  return null;
}

export default IPCPlayerEvents;
