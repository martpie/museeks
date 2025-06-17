import { useLingui } from '@lingui/react/macro';

import ButtonIcon from '../elements/ButtonIcon';
import usePlayerStore, { usePlayerAPI } from '../stores/usePlayerStore';
import { PlayerStatus } from '../types/museeks';
import styles from './PlayerControls.module.css';
import VolumeControl from './VolumeControl';

export default function PlayerControls() {
  const playerAPI = usePlayerAPI();
  const playerStatus = usePlayerStore((state) => state.playerStatus);
  const { t } = useLingui();

  return (
    <div className={styles.playerControls}>
      <ButtonIcon
        icon="skipBack"
        iconSize={16}
        title={t`Previous`}
        onClick={playerAPI.previous}
      />
      <ButtonIcon
        icon={playerStatus === PlayerStatus.PLAY ? 'pause' : 'play'}
        iconSize={28}
        title={playerStatus === PlayerStatus.PLAY ? t`Pause` : t`Play`}
        onClick={playerAPI.playPause}
      />
      <ButtonIcon
        icon="skipForward"
        iconSize={16}
        title={t`Next`}
        onClick={playerAPI.next}
      />
      <VolumeControl />
    </div>
  );
}
