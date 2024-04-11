import Icon from 'react-fontawesome';

import VolumeControl from '../VolumeControl/VolumeControl';
import { PlayerStatus } from '../../types/museeks';
import usePlayerStore, { usePlayerAPI } from '../../stores/usePlayerStore';

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
        data-museeks-action
      >
        <Icon name="backward" />
      </button>
      <button
        type="button"
        className={`${styles.control} ${styles.play}`}
        title={playerStatus === PlayerStatus.PLAY ? 'Pause' : 'Play'}
        onClick={playerAPI.playPause}
        data-museeks-action
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
        data-museeks-action
      >
        <Icon name="forward" />
      </button>
      <VolumeControl />
    </div>
  );
}
