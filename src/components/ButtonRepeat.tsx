import { useLingui } from '@lingui/react/macro';

import ButtonIcon from '../elements/ButtonIcon';
import usePlayerStore, { usePlayerAPI } from '../stores/usePlayerStore';

export default function ButtonRepeat() {
  const repeat = usePlayerStore((state) => state.repeat);
  const playerAPI = usePlayerAPI();
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
      onClick={() => playerAPI.toggleRepeat()}
      isActive={repeat === 'One' || repeat === 'All'}
      aria-pressed={pressed}
    />
  );
}
