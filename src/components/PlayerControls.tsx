import usePlayerStore, { usePlayerAPI } from '../stores/usePlayerStore';
import { PlayerStatus } from '../types/museeks';
import Icon from './Icon';
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
        data-museeks-action
      >
        <Icon name="previous" />
      </button>
      <button
        type="button"
        className={`${styles.control} ${styles.play}`}
        title={playerStatus === PlayerStatus.PLAY ? 'Pause' : 'Play'}
        onClick={playerAPI.playPause}
        data-museeks-action
      >
        <Icon name={playerStatus === PlayerStatus.PLAY ? 'pause' : 'play'} />
      </button>
      <button
        type="button"
        className={styles.control}
        title="Next"
        onClick={playerAPI.next}
        data-museeks-action
      >
        <Icon name="next" />
      </button>
      <VolumeControl />
    </div>
  );
}
