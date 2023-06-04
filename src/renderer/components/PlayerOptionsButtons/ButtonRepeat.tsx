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
  const playerState = usePlayerStore((state) => ({ repeat: state.repeat, toggleRepeat: state.toggleRepeat }));

  const svg = svgMap[playerState.repeat] || svgMap.default;
  const buttonClasses = cx(styles.button, {
    [styles.active]: playerState.repeat === Repeat.ONE || playerState.repeat === Repeat.ALL,
  });

  const toggleRepeat = () => {
    let repeat = Repeat.NONE;

    switch (playerState.repeat) {
      case Repeat.NONE:
        repeat = Repeat.ALL;
        break;
      case Repeat.ALL:
        repeat = Repeat.ONE;
        break;
      case Repeat.ONE:
        repeat = Repeat.NONE;
        break;
      default:
        break;
    }

    playerState.toggleRepeat(repeat);
  };

  return (
    <button className={buttonClasses} onClick={toggleRepeat}>
      <InlineSVG src={svg} className={styles.icon} />
    </button>
  );
}
