import type { Track } from '../generated/typings';
import usePlayerStore from '../stores/usePlayerStore';

export default function usePlayingTrack(): Track | null {
  return usePlayerStore((state) => {
    if (state.queue.length > 0 && state.queueCursor !== null) {
      return state.queue[state.queueCursor];
    }

    return null;
  });
}
