import InlineSVG from 'svg-inline-react';
import cx from 'classnames';

import { Repeat } from '../../../shared/types/museeks';
import icons from '../../lib/icons';
import usePlayerStore from '../../stores/usePlayerStore';

import styles from './common.module.css';

const svgMap = {
  [Repeat.ONE]: icons.REPEAT_ONE,
  [Repeat.ALL]: icons.REPEAT,
  [Repeat.NONE]: icons.REPEAT,
  default: icons.REPEAT,
};

export default function ButtonRepeat() {
  const repeat = usePlayerStore((state) => state.repeat);
  const playerAPI = usePlayerStore((state) => state.api);

  const svg = svgMap[repeat] || svgMap.default;
  const buttonClasses = cx(styles.button, {
    [styles.active]: repeat === Repeat.ONE || repeat === Repeat.ALL,
  });

  return (
    <button className={buttonClasses} onClick={() => playerAPI.toggleRepeat()}>
      <InlineSVG src={svg} className={styles.icon} />
    </button>
  );
}
