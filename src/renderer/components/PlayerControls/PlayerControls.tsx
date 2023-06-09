import Icon from 'react-fontawesome';

import VolumeControl from '../VolumeControl/VolumeControl';
import { PlayerStatus } from '../../../shared/types/museeks';
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
      >
        <Icon name="backward" />
      </button>
      <button
        className={`${styles.control} ${styles.play}`}
        title={playerStatus === PlayerStatus.PLAY ? 'Pause' : 'Play'}
        onClick={playerAPI.playPause}
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
      >
        <Icon name="forward" />
      </button>
      <VolumeControl />
    </div>
  );
}
