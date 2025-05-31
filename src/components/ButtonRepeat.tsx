import { useLingui } from '@lingui/react/macro';
import cx from 'classnames';

import usePlayerStore, { usePlayerAPI } from '../stores/usePlayerStore';
import styles from './ButtonShuffleRepeat.module.css';
import Icon from './Icon';

export default function ButtonRepeat() {
  const repeat = usePlayerStore((state) => state.repeat);
  const playerAPI = usePlayerAPI();
  const { t } = useLingui();

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
      <Icon
        name={repeat === 'One' ? 'repeat_one' : 'repeat'}
        className={styles.icon}
      />
    </button>
  );
}
