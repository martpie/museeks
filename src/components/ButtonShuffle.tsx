import { t } from '@lingui/core/macro';
import cx from 'classnames';

import usePlayerStore, { usePlayerAPI } from '../stores/usePlayerStore';
import styles from './ButtonShuffleRepeat.module.css';
import Icon from './Icon';

export default function ButtonShuffle() {
  const shuffle = usePlayerStore((state) => state.shuffle);
  const playerAPI = usePlayerAPI();

  const buttonClasses = cx(styles.button, {
    [styles.active]: shuffle,
  });

  return (
    // This should be a checkbox for accessibility
    <button
      type="button"
      className={buttonClasses}
      onClick={() => {
        playerAPI.toggleShuffle();
      }}
      data-museeks-action
      role="menuitemcheckbox"
      aria-checked={shuffle}
      title={t`Shuffle`}
    >
      <Icon name="shuffle" size={12} className={styles.icon} />
    </button>
  );
}
