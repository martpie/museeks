import cx from 'classnames';

import usePlayerStore, { usePlayerAPI } from '../stores/usePlayerStore';
import Icon from './Icon';

import styles from './ButtonShuffleRepeat.module.css';

export default function ButtonRepeat() {
  const repeat = usePlayerStore((state) => state.repeat);
  const playerAPI = usePlayerAPI();

  const buttonClasses = cx(styles.button, {
    [styles.active]: repeat === 'One' || repeat === 'All',
  });

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={() => playerAPI.toggleRepeat()}
      data-museeks-action
    >
      <Icon
        name={repeat === 'One' ? 'repeat_one' : 'repeat'}
        className={styles.icon}
      />
    </button>
  );
}
