import { useEffect, useState } from 'react';

import player from '../lib/player';

/**
 * Returns the current track elapsed time
 */
export default function usePlayingTrackCurrentTime(): number {
  const [currentTime, setCurrentTime] = useState(player.getCurrentTime());

  useEffect(() => {
    function tick() {
      setCurrentTime(player.getCurrentTime());
    };

    player.getAudio().addEventListener('timeupdate', tick);

    return () => {
      player.getAudio().removeEventListener('timeupdate', tick);
    };
  }, []);

  return currentTime;
}
