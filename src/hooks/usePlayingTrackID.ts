import usePlayingTrack from './usePlayingTrack';

export default function usePlayingTrackID(): string | null {
  return usePlayingTrack()?._id ?? null;
}
