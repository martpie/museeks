import cx from 'classnames';
import InlineSVG from 'svg-inline-react';

import type { Repeat } from '../../generated/typings';
import icons from '../../lib/icons';
import usePlayerStore, { usePlayerAPI } from '../../stores/usePlayerStore';

import styles from './common.module.css';

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

  const svg = getIcon(repeat);
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
      <InlineSVG src={svg} className={styles.icon} />
    </button>
  );
}
