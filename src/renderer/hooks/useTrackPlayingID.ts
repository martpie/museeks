import usePlayerStore from '../stores/usePlayerStore';

export default function useTrackPlayingID(): string | null {
  return usePlayerStore((state) => {
    if (state.queue.length > 0 && state.queueCursor !== null) {
      return state.queue[state.queueCursor]._id;
    }

    return null;
  });
}
