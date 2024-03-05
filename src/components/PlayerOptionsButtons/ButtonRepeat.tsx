import InlineSVG from 'svg-inline-react';
import cx from 'classnames';

import icons from '../../lib/icons';
import usePlayerStore, { usePlayerAPI } from '../../stores/usePlayerStore';
import { Repeat } from '../../generated/typings';

import styles from './common.module.css';

function getIcon(repeat: Repeat) {
  switch (repeat) {
    case 'One':
      return icons.REPEAT_ONE;
    case 'None':
    case 'All':
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
    <button className={buttonClasses} onClick={() => playerAPI.toggleRepeat()}>
      <InlineSVG src={svg} className={styles.icon} />
    </button>
  );
}
