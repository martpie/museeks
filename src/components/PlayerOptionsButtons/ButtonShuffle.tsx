import cx from 'classnames';
import InlineSVG from 'svg-inline-react';

import icons from '../../lib/icons';
import usePlayerStore, { usePlayerAPI } from '../../stores/usePlayerStore';

import styles from './common.module.css';

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
      <InlineSVG src={icons.SHUFFLE} className={styles.icon} />
    </button>
  );
}
