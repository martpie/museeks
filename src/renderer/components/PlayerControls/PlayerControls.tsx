import Icon from 'react-fontawesome';

import VolumeControl from '../VolumeControl/VolumeControl';
import { PlayerStatus } from '../../../shared/types/museeks';
import usePlayerStore from '../../stores/usePlayerStore';

import styles from './PlayerControls.module.css';

type Props = {
  playerStatus: PlayerStatus;
};

export default function PlayerControls(props: Props) {
  const playerAPI = usePlayerStore((state) => state.api);

  return (
    <div className={styles.playerControls}>
      <button type='button' className={styles.control} title='Previous' onClick={playerAPI.previous}>
        <Icon name='backward' />
      </button>
      <button
        className={`${styles.control} ${styles.play}`}
        title={props.playerStatus === PlayerStatus.PLAY ? 'Pause' : 'Play'}
        onClick={playerAPI.playPause}
      >
        <Icon name={props.playerStatus === PlayerStatus.PLAY ? 'pause' : 'play'} fixedWidth />
      </button>
      <button type='button' className={styles.control} title='Next' onClick={playerAPI.next}>
        <Icon name='forward' />
      </button>
      <VolumeControl />
    </div>
  );
}
