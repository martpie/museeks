import * as React from 'react';
import InlineSVG from 'svg-inline-react';
import cx from 'classnames';

import * as PlayerActions from '../../actions/PlayerActions';

import * as styles from './common.css';

const svg = require('../../../images/icons/player-shuffle.svg');

interface Props {
  shuffle: boolean;
}

export default class ButtonShuffle extends React.Component<Props> {
  constructor (props: Props) {
    super(props);

    this.toggleShuffle = this.toggleShuffle.bind(this);
  }

  toggleShuffle () {
    PlayerActions.shuffle(!this.props.shuffle);
  }

  render () {
    const buttonClasses = cx(styles.button, {
      [styles.active]: this.props.shuffle
    });

    return (
      <button type='button' className={buttonClasses} onClick={this.toggleShuffle}>
        <InlineSVG src={svg} className={styles.icon} />
      </button>
    );
  }
}
