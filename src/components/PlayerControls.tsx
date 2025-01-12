import Icon from 'react-fontawesome';

import usePlayerStore, { usePlayerAPI } from '../stores/usePlayerStore';
import { PlayerStatus } from '../types/syncudio';
import VolumeControl from './VolumeControl';

import styles from './PlayerControls.module.css';

export default function PlayerControls() {
  const playerAPI = usePlayerAPI();
  const playerStatus = usePlayerStore((state) => state.playerStatus);

  return (
    <div className={styles.playerControls}>
      <button
        type="button"
        className={styles.control}
        title="Previous"
        onClick={playerAPI.previous}
        data-syncudio-action
      >
        <Icon name="backward" />
      </button>
      <button
        type="button"
        className={`${styles.control} ${styles.play}`}
        title={playerStatus === PlayerStatus.PLAY ? 'Pause' : 'Play'}
        onClick={playerAPI.playPause}
        data-syncudio-action
      >
        <Icon
          name={playerStatus === PlayerStatus.PLAY ? 'pause' : 'play'}
          fixedWidth
        />
      </button>
      <button
        type="button"
        className={styles.control}
        title="Next"
        onClick={playerAPI.next}
        data-syncudio-action
      >
        <Icon name="forward" />
      </button>
      <VolumeControl />
    </div>
  );
}
