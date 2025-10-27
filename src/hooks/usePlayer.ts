import { useSyncExternalStore } from 'react';

import type { Track } from '../generated/typings';
import player, { type PlayerState as PlayerStateType } from '../lib/player';

/**
 * Hook to get a specific slice of player state.
 * Uses useSyncExternalStore for optimal performance and only re-renders when the selected value changes.
 */
export function usePlayerState<T>(selector: (state: PlayerStateType) => T): T {
  return useSyncExternalStore(
    (callback) => {
      player.on('stateChange', callback);
      return () => {
        player.off('stateChange', callback);
      };
    },
    () => selector(player.getState()),
    () => selector(player.getState()),
  );
}

/**
 * Hook to get the currently playing track
 */
export function usePlayingTrack(): Track | null {
  return usePlayerState((state) => {
    if (state.queue.length > 0 && state.queueCursor !== null) {
      return state.queue[state.queueCursor];
    }
    return null;
  });
}

/**
 * Hook to get current playback time that updates frequently.
 * Uses useSyncExternalStore for optimal performance.
 */
export function usePlayingTrackCurrentTime(): number {
  return useSyncExternalStore(
    (callback) => {
      player.on('timeupdate', callback);
      return () => {
        player.off('timeupdate', callback);
      };
    },
    () => player.getCurrentTime(),
    () => player.getCurrentTime(),
  );
}
