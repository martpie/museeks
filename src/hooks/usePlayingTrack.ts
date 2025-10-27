import type { Track } from '../generated/typings';
import { usePlayerState } from './usePlayer';

export default function usePlayingTrack(): Track | null {
  return usePlayerState((state) => {
    if (state.queue.length > 0 && state.queueCursor !== null) {
      return state.queue[state.queueCursor];
    }

    return null;
  });
}
