import React from 'react';
import InlineSVG from 'svg-inline-react';
import cx from 'classnames';

import playerShuffleIcon from '../../../images/icons/player-shuffle.svg';

import * as PlayerActions from '../../store/actions/PlayerActions';

import styles from './common.module.css';

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
    const buttonClasses = cx(styles.button, {
      [styles.active]: this.props.shuffle,
    });

    return (
      <button type='button' className={buttonClasses} onClick={this.toggleShuffle}>
        <InlineSVG src={playerShuffleIcon} className={styles.icon} />
      </button>
    );
  }
}
