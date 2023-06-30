import { TrackModel } from '../../shared/types/museeks';
import usePlayerStore from '../stores/usePlayerStore';

export default function usePlayingTrack(): TrackModel | null {
  return usePlayerStore((state) => {
    if (state.queue.length > 0 && state.queueCursor !== null) {
      return state.queue[state.queueCursor];
    }

    return null;
  });
}
