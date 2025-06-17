import { t } from '@lingui/core/macro';

import ButtonIcon from '../elements/ButtonIcon';
import usePlayerStore, { usePlayerAPI } from '../stores/usePlayerStore';

export default function ButtonShuffle() {
  const shuffle = usePlayerStore((state) => state.shuffle);
  const playerAPI = usePlayerAPI();

  return (
    <ButtonIcon
      title={t`Shuffle`}
      onClick={() => playerAPI.toggleShuffle()}
      icon={'shuffle'}
      iconSize={20}
      isActive={shuffle}
      aria-pressed={shuffle}
    />
  );
}
