import { useEffect, useState } from 'react';

import player from '../lib/player';

/**
 * Returns the current track elapsed time
 */
export default function usePlayingTrackCurrentTime(): number {
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
