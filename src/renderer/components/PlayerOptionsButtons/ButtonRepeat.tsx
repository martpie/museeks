import InlineSVG from 'svg-inline-react';
import cx from 'classnames';

import * as PlayerActions from '../../store/actions/PlayerActions';
import { Repeat } from '../../../shared/types/museeks';
import icons from '../../lib/icons';

import styles from './common.module.css';

const svgMap = {
  [Repeat.ONE]: icons.REPEAT_ONE,
  [Repeat.ALL]: icons.REPEAT,
  [Repeat.NONE]: icons.REPEAT,
  default: icons.REPEAT,
};

interface Props {
  repeat: Repeat;
}

function ButtonRepeat(props: Props) {
  const svg = svgMap[props.repeat] || svgMap.default;
  const buttonClasses = cx(styles.button, {
    [styles.active]: props.repeat === Repeat.ONE || props.repeat === Repeat.ALL,
  });

  const toggleRepeat = () => {
    let repeat = Repeat.NONE;

    switch (props.repeat) {
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

    PlayerActions.repeat(repeat);
  };

  return (
    <button className={buttonClasses} onClick={toggleRepeat}>
      <InlineSVG src={svg} className={styles.icon} />
    </button>
  );
}

export default ButtonRepeat;
