import { t } from '@lingui/core/macro';
import cx from 'classnames';

import icons from '../lib/icons';
import usePlayerStore, { usePlayerAPI } from '../stores/usePlayerStore';
import styles from './ButtonShuffleRepeat.module.css';

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
      <icons.SHUFFLE className={styles.icon} />
    </button>
  );
}
