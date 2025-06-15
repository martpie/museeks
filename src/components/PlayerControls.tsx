import { useLingui } from '@lingui/react/macro';
import Icon from 'react-fontawesome';

import usePlayerStore, { usePlayerAPI } from '../stores/usePlayerStore';
import { PlayerStatus } from '../types/museeks';
import VolumeControl from './VolumeControl';

import styles from './PlayerControls.module.css';

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
        <Icon name="backward" />
      </button>
      <button
        type="button"
        className={`${styles.control} ${styles.play}`}
        title={playerStatus === PlayerStatus.PLAY ? t`Pause` : t`Play`}
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
        title={t`Next`}
        onClick={playerAPI.next}
        data-museeks-action
      >
        <Icon name="forward" />
      </button>
      <VolumeControl />
    </div>
  );
}
