import { useMemo, useState } from 'react';

import usePlayerStore, { usePlayerAPI } from '../stores/usePlayerStore';
import { PlayerStatus } from '../types/museeks';
import Icon from './Icon';
import styles from './PlayingIndicator.module.css';

export default function TrackPlayingIndicator() {
  const [hovered, setHovered] = useState(false);
  const playerStatus = usePlayerStore((state) => state.playerStatus);
  const playerAPI = usePlayerAPI();

  const icon = useMemo(() => {
    if (playerStatus === PlayerStatus.PLAY) {
      if (hovered) {
        return <Icon name="pause" />;
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
  }, [playerStatus, hovered]);

  return (
    <button
      type="button"
      className={`${styles.playingIndicator} reset`}
      onClick={playerAPI.playPause}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      data-museeks-action
    >
      {icon}
    </button>
  );
}
