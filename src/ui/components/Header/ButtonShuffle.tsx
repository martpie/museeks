import * as React from 'react';
import InlineSVG from 'svg-inline-react';
import classnames from 'classnames';

import * as PlayerActions from '../../actions/PlayerActions';


const svg = require('../../../images/icons/player-shuffle.svg');

/*
|--------------------------------------------------------------------------
| ShuffleButton
|--------------------------------------------------------------------------
*/

interface Props {
  shuffle: boolean;
}


export default class ButtonShuffle extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.toggleShuffle = this.toggleShuffle.bind(this);
  }

  toggleShuffle() {
    PlayerActions.shuffle(!this.props.shuffle);
  }

  render() {
    const buttonClasses = classnames('button', {
      active: this.props.shuffle,
    });

    return (
      <button type="button" className={buttonClasses} onClick={this.toggleShuffle}>
        <InlineSVG src={svg} className="icon shuffle" />
      </button>
    );
  }
}
