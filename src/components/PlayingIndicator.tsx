import { useState } from 'react';
import Icon from 'react-fontawesome';

import usePlayerStore, { usePlayerAPI } from '../stores/usePlayerStore';
import { PlayerStatus } from '../types/syncudio';

import styles from './PlayingIndicator.module.css';

const getIcon = (state: PlayerStatus, hovered: boolean) => {
  if (state === PlayerStatus.PLAY) {
    if (hovered) {
      return <Icon name="pause" fixedWidth />;
    }

    return (
      <div className={styles.animation}>
        <div className={`${styles.bar}`} />
        <div className={`${styles.bar} ${styles.barSecond}`} />
        <div className={`${styles.bar} ${styles.barThird}`} />
      </div>
    );
  }

  return <Icon name="play" fixedWidth />;
};

export default function TrackPlayingIndicator() {
  const [hovered, setHovered] = useState(false);
  const playerStatus = usePlayerStore((state) => state.playerStatus);
  const playerAPI = usePlayerAPI();

  const icon = getIcon(playerStatus, hovered);

  return (
    <button
      type="button"
      className={`${styles.playingIndicator} reset`}
      onClick={playerAPI.playPause}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      data-syncudio-action
    >
      {icon}
    </button>
  );
}
