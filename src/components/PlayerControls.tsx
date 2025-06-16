import { useLingui } from '@lingui/react/macro';

import usePlayerStore, { usePlayerAPI } from '../stores/usePlayerStore';
import { PlayerStatus } from '../types/museeks';
import Icon from './Icon';
import styles from './PlayerControls.module.css';
import VolumeControl from './VolumeControl';

export default function PlayerControls() {
  const playerAPI = usePlayerAPI();
  const playerStatus = usePlayerStore((state) => state.playerStatus);
  const { t } = useLingui();

  return (
    <div className={styles.playerControls}>
      <button
        type="button"
        className={styles.control}
        title={t`Previous`}
        onClick={playerAPI.previous}
        data-museeks-action
      >
        <Icon name="previous" />
      </button>
      <button
        type="button"
        className={`${styles.control} ${styles.play}`}
        title={playerStatus === PlayerStatus.PLAY ? t`Pause` : t`Play`}
        onClick={playerAPI.playPause}
        data-museeks-action
      >
        <Icon name={playerStatus === PlayerStatus.PLAY ? 'pause' : 'play'} />
      </button>
      <button
        type="button"
        className={styles.control}
        title={t`Next`}
        onClick={playerAPI.next}
        data-museeks-action
      >
        <Icon name="next" />
      </button>
      <VolumeControl />
    </div>
  );
}
