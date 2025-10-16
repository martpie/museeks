import { useEffect, useState, useSyncExternalStore } from 'react';

import type { Track } from '../generated/typings';
import player, { type PlayerState as PlayerStateType } from '../lib/player';

/**
 * Hook to get the full player state.
 * Uses React 18's useSyncExternalStore for optimal performance.
 */
export function usePlayerFullState(): PlayerStateType {
  return useSyncExternalStore(
    (callback) => {
      player.on('stateChange', callback);
      return () => {
        player.off('stateChange', callback);
      };
    },
    () => player.getState(),
    () => player.getState(),
  );
}

/**
 * Hook to get a specific slice of player state.
 * Only re-renders when the selected value changes.
 */
export function usePlayerState<T>(selector: (state: PlayerStateType) => T): T {
  const [value, setValue] = useState(() => selector(player.getState()));

  useEffect(() => {
    const handleChange = (state: PlayerStateType) => {
      const newValue = selector(state);
      setValue((prev) => {
        // Only update if value actually changed
        if (prev !== newValue) {
          return newValue;
        }
        return prev;
      });
    };

    player.on('stateChange', handleChange);
    return () => {
      player.off('stateChange', handleChange);
    };
  }, [selector]);

  return value;
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
 * Hook to get current playback time that updates frequently
 */
export function usePlayingTrackCurrentTime(): number {
  const [currentTime, setCurrentTime] = useState(player.getCurrentTime());

  useEffect(() => {
    function tick(time: number) {
      setCurrentTime(time);
    }

    player.on('timeupdate', tick);

    return () => {
      player.off('timeupdate', tick);
    };
  }, []);

  return currentTime;
}

/**
 * Legacy hook for backwards compatibility
 */
export default usePlayerFullState;
