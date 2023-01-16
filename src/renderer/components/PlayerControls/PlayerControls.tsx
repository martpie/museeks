import React from 'react';
import Icon from 'react-fontawesome';

import VolumeControl from '../VolumeControl/VolumeControl';
import * as PlayerActions from '../../store/actions/PlayerActions';
import { PlayerStatus } from '../../../shared/types/museeks';

import styles from './PlayerControls.module.css';

interface Props {
  playerStatus: PlayerStatus;
}

const PlayerControls: React.FC<Props> = (props) => {
  return (
    <div className={styles.playerControls}>
      <button type='button' className={styles.control} title='Previous' onClick={PlayerActions.previous}>
        <Icon name='backward' />
      </button>
      <button
        className={`${styles.control} ${styles.play}`}
        title={props.playerStatus === PlayerStatus.PLAY ? 'Pause' : 'Play'}
        onClick={PlayerActions.playPause}
      >
        <Icon name={props.playerStatus === PlayerStatus.PLAY ? 'pause' : 'play'} fixedWidth />
      </button>
      <button type='button' className={styles.control} title='Next' onClick={PlayerActions.next}>
        <Icon name='forward' />
      </button>
      <VolumeControl />
    </div>
  );
};

export default PlayerControls;
