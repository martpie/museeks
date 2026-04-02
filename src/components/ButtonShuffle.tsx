import { t } from '@lingui/core/macro';

import ButtonIcon from '../elements/ButtonIcon';
import { usePlayerState } from '../hooks/usePlayer';
import player from '../lib/player';

export default function ButtonShuffle() {
  const shuffle = usePlayerState((state) => state.shuffle);

  return (
    <ButtonIcon
      label={t`Shuffle`}
      onClick={() => player.toggleShuffle()}
      icon={'shuffle'}
      iconSize={20}
      isActive={shuffle}
      aria-pressed={shuffle}
    />
  );
}
