import InlineSVG from 'svg-inline-react';
import cx from 'classnames';

import icons from '../../lib/icons';
import usePlayerStore from '../../stores/usePlayerStore';

import styles from './common.module.css';

export default function ButtonShuffle() {
  const { shuffle, toggleSuffle } = usePlayerStore((state) => ({
    shuffle: state.shuffle,
    toggleSuffle: state.toggleShuffle,
  }));

  const buttonClasses = cx(styles.button, {
    [styles.active]: shuffle,
  });

  return (
    <button
      type='button'
      className={buttonClasses}
      onClick={() => {
        toggleSuffle(!shuffle);
      }}
    >
      <InlineSVG src={icons.SHUFFLE} className={styles.icon} />
    </button>
  );
}
