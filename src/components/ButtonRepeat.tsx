import { useLingui } from '@lingui/react/macro';
import cx from 'classnames';

import type { Repeat } from '../generated/typings';
import icons from '../lib/icons';
import usePlayerStore, { usePlayerAPI } from '../stores/usePlayerStore';

import styles from './ButtonShuffleRepeat.module.css';

function getIcon(repeat: Repeat) {
  switch (repeat) {
    case 'One':
      return icons.REPEAT_ONE;
    default:
      return icons.REPEAT;
  }
}

export default function ButtonRepeat() {
  const repeat = usePlayerStore((state) => state.repeat);
  const playerAPI = usePlayerAPI();
  const { t } = useLingui();

  const Svg = getIcon(repeat);
  const buttonClasses = cx(styles.button, {
    [styles.active]: repeat === 'One' || repeat === 'All',
  });

  return (
    // This should be a checkbox for accessibility
    <button
      type="button"
      className={buttonClasses}
      onClick={() => playerAPI.toggleRepeat()}
      data-museeks-action
      role="menuitemcheckbox"
      aria-checked={repeat === 'One' || repeat === 'All'}
      title={t`Repeat`}
    >
      <Svg className={styles.icon} />
    </button>
  );
}
