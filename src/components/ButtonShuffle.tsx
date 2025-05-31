import cx from 'classnames';

import usePlayerStore, { usePlayerAPI } from '../stores/usePlayerStore';
import Icon from './Icon';

import styles from './ButtonShuffleRepeat.module.css';

export default function ButtonShuffle() {
  const shuffle = usePlayerStore((state) => state.shuffle);
  const playerAPI = usePlayerAPI();

  const buttonClasses = cx(styles.button, {
    [styles.active]: shuffle,
  });

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={() => {
        playerAPI.toggleShuffle();
      }}
      data-museeks-action
    >
      <Icon name="shuffle" className={styles.icon} />
    </button>
  );
}
