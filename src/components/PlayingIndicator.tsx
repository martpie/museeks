import { useMemo, useState } from 'react';

import { usePlayerState } from '../hooks/usePlayer';
import player from '../lib/player';
import Icon from './Icon';
import styles from './PlayingIndicator.module.css';

export default function TrackPlayingIndicator() {
  const [hovered, setHovered] = useState(false);
  const isPaused = usePlayerState((state) => state.isPaused);

  const icon = useMemo(() => {
    if (!isPaused) {
      if (hovered) {
        return <Icon name="pause" size={12} />;
      }

      return (
        <div className={styles.animation}>
          <div className={`${styles.bar}`} />
          <div className={`${styles.bar} ${styles.barSecond}`} />
          <div className={`${styles.bar} ${styles.barThird}`} />
        </div>
      );
    }

    return <Icon name="play" />;
  }, [isPaused, hovered]);

  return (
    <button
      type="button"
      className={styles.playingIndicator}
      onClick={player.playPause}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      data-museeks-action
    >
      {icon}
    </button>
  );
}
