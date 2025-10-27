import { useLingui } from '@lingui/react/macro';

import ButtonIcon from '../elements/ButtonIcon';
import { usePlayerState } from '../hooks/usePlayer';
import player from '../lib/player';

export default function ButtonRepeat() {
  const repeat = usePlayerState((state) => state.repeat);
  const { t } = useLingui();

  let pressed: boolean | 'mixed' = false;
  if (repeat === 'All') pressed = true;
  if (repeat === 'One') pressed = 'mixed';

  return (
    // This should be a checkbox for accessibility
    <ButtonIcon
      title={t`Repeat`}
      icon={repeat === 'One' ? 'repeatOne' : 'repeat'}
      iconSize={20}
      onClick={player.toggleRepeat}
      isActive={repeat === 'One' || repeat === 'All'}
      aria-pressed={pressed}
    />
  );
}
