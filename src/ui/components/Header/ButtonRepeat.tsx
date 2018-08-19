import * as React from 'react';
import InlineSVG from 'svg-inline-react';
import classnames from 'classnames';

import * as PlayerActions from '../../actions/PlayerActions';
import { Repeat } from '../../typings/interfaces';

const svgMap = {
  [Repeat.ONE]: require('../../../images/icons/player-repeat-one.svg'),
  [Repeat.ALL]: require('../../../images/icons/player-repeat.svg'),
  [Repeat.NONE]: require('../../../images/icons/player-repeat.svg'),
  default: require('../../../images/icons/player-repeat.svg'),
};

/*
|--------------------------------------------------------------------------
| RepeatButton
|--------------------------------------------------------------------------
*/

interface Props {
  repeat: Repeat;
}

export default class ButtonRepeat extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.toggleRepeat = this.toggleRepeat.bind(this);
  }

  toggleRepeat() {
    let repeat = Repeat.NONE;

    switch (this.props.repeat) {
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
  }

  render() {
    const svg = svgMap[this.props.repeat] || svgMap.default;
    const buttonClasses = classnames('button repeat', {
      active: this.props.repeat === Repeat.ONE || this.props.repeat === Repeat.ALL,
    });

    const svgClasses = classnames('icon', {
      'repeat-one': this.props.repeat === Repeat.ONE,
      repeat: this.props.repeat !== Repeat.ONE,
    });

    return (
      <button className={buttonClasses} onClick={this.toggleRepeat}>
        <InlineSVG src={svg} className={svgClasses} />
      </button>
    );
  }
}
