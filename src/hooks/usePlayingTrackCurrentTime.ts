import { useCallback, useEffect, useState } from 'react';

import player from '../lib/player';

/**
 * Returns the current track elapsed time
 */
export default function usePlayingTrackCurrentTime(): number {
  const [currentTime, setCurrentTime] = useState(player.getCurrentTime());

  const tick = useCallback(() => {
    setCurrentTime(player.getCurrentTime());
  }, [setCurrentTime]);

  useEffect(() => {
    player.getAudio().addEventListener('timeupdate', tick);

    return () => {
      player.getAudio().removeEventListener('timeupdate', tick);
    };
  }, [tick]);

  return currentTime;
}
