import PlayingBarInfos from '../PlayingBarInfo/PlayingBarInfo';
import Cover from '../Cover/Cover';
import usePlayerStore from '../../stores/usePlayerStore';
import ButtonRepeat from '../PlayerOptionsButtons/ButtonRepeat';
import ButtonShuffle from '../PlayerOptionsButtons/ButtonShuffle';
import { Track } from '../../generated/typings';

import styles from './PlayingBar.module.css';

type Props = {
  trackPlaying: Track;
};

export default function PlayingBar(props: Props) {
  const repeat = usePlayerStore((state) => state.repeat);
  const shuffle = usePlayerStore((state) => state.shuffle);
  const trackPlaying = props.trackPlaying;

  return (
    <div className={styles.playingBar}>
      <div className={styles.playingBar__cover}>
        <Cover track={trackPlaying} noBorder />
      </div>
      <PlayingBarInfos
        trackPlaying={trackPlaying}
        shuffle={shuffle}
        repeat={repeat}
      />
      <div className={styles.playerOptions}>
        <ButtonRepeat />
        <ButtonShuffle />
      </div>
    </div>
  );
}
