import Icon from 'react-fontawesome';

import VolumeControl from '../VolumeControl/VolumeControl';
import { PlayerStatus } from '../../../shared/types/museeks';
import usePlayerStore from '../../stores/usePlayerStore';

import styles from './PlayerControls.module.css';

type Props = {
  playerStatus: PlayerStatus;
};

export default function PlayerControls(props: Props) {
  const playerState = usePlayerStore((state) => ({
    previous: state.previous,
    next: state.next,
    playPause: state.playPause,
  }));

  return (
    <div className={styles.playerControls}>
      <button type='button' className={styles.control} title='Previous' onClick={playerState.previous}>
        <Icon name='backward' />
      </button>
      <button
        className={`${styles.control} ${styles.play}`}
        title={props.playerStatus === PlayerStatus.PLAY ? 'Pause' : 'Play'}
        onClick={playerState.playPause}
      >
        <Icon name={props.playerStatus === PlayerStatus.PLAY ? 'pause' : 'play'} fixedWidth />
      </button>
      <button type='button' className={styles.control} title='Next' onClick={playerState.next}>
        <Icon name='forward' />
      </button>
      <VolumeControl />
    </div>
  );
}
