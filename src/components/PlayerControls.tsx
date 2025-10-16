import { useLingui } from '@lingui/react/macro';

import ButtonIcon from '../elements/ButtonIcon';
import { usePlayerState } from '../hooks/usePlayer';
import player from '../lib/player';
import styles from './PlayerControls.module.css';
import VolumeControl from './VolumeControl';

export default function PlayerControls() {
  const isPaused = usePlayerState((state) => state.isPaused);
  const { t } = useLingui();

  return (
    <div className={styles.playerControls}>
      <ButtonIcon
        icon="skipBack"
        iconSize={16}
        title={t`Previous`}
        onClick={player.previous}
        data-testid="playercontrol-skipback"
      />
      <ButtonIcon
        icon={isPaused ? 'play' : 'pause'}
        iconSize={28}
        title={isPaused ? t`Play` : t`Pause`}
        onClick={player.playPause}
        data-testid={isPaused ? 'playercontrol-play' : 'playercontrol-pause'}
      />
      <ButtonIcon
        icon="skipForward"
        iconSize={16}
        title={t`Next`}
        onClick={player.next}
        data-testid="playercontrol-skipforward"
      />
      <VolumeControl />
    </div>
  );
}
