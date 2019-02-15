import * as React from 'react';
import * as Icon from 'react-fontawesome';
import VolumeControl from '../VolumeControl/VolumeControl';

import * as PlayerActions from '../../actions/PlayerActions';
import { PlayerStatus } from '../../../shared/types/interfaces';

import * as styles from './PlayerControls.css';

interface Props {
  playerStatus: PlayerStatus;
}

export default class PlayerControls extends React.PureComponent<Props> {
  render () {
    return (
      <div className={styles.playerControls}>
        <button
          type='button'
          className={styles.control}
          title='Previous'
          onClick={PlayerActions.previous}
        >
          <Icon name='backward' />
        </button>
        <button
          className={`${styles.control} ${styles.play}`}
          title={this.props.playerStatus === PlayerStatus.PLAY ? 'Pause' : 'Play'}
          onClick={PlayerActions.playPause}
        >
          <Icon name={this.props.playerStatus === PlayerStatus.PLAY ? 'pause' : 'play'} fixedWidth />
        </button>
        <button
          type='button'
          className={styles.control}
          title='Next'
          onClick={PlayerActions.next}
        >
          <Icon name='forward' />
        </button>
        <VolumeControl />
      </div>
    );
  }
}
