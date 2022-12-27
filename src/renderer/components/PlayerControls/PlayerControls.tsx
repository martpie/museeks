import React from 'react';
import Icon from 'react-fontawesome';

import { PlayerStatus } from '~shared/types/museeks';

import VolumeControl from '../VolumeControl/VolumeControl';
import * as PlayerActions from '../../store/actions/PlayerActions';

import styles from './PlayerControls.module.css';

interface Props {
  playerStatus: PlayerStatus;
}

export default class PlayerControls extends React.PureComponent<Props> {
  render() {
    return (
      <div className={styles.playerControls}>
        <button type='button' className={styles.control} title='Previous' onClick={PlayerActions.previous}>
          <Icon name='backward' />
        </button>
        <button
          className={`${styles.control} ${styles.play}`}
          title={this.props.playerStatus === PlayerStatus.PLAY ? 'Pause' : 'Play'}
          onClick={PlayerActions.playPause}
        >
          <Icon name={this.props.playerStatus === PlayerStatus.PLAY ? 'pause' : 'play'} fixedWidth />
        </button>
        <button type='button' className={styles.control} title='Next' onClick={PlayerActions.next}>
          <Icon name='forward' />
        </button>
        <VolumeControl />
      </div>
    );
  }
}
