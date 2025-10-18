import type { Track } from '../generated/typings';
import { usePlayerState } from '../hooks/usePlayer';
import ButtonRepeat from './ButtonRepeat';
import ButtonShuffle from './ButtonShuffle';
import Cover from './Cover';
import styles from './PlayingBar.module.css';
import PlayingBarInfos from './PlayingBarInfo';

type Props = {
  trackPlaying: Track;
};

export default function PlayingBar(props: Props) {
  const repeat = usePlayerState((state) => state.repeat);
  const shuffle = usePlayerState((state) => state.shuffle);
  const trackPlaying = props.trackPlaying;

  return (
    <div className={styles.playingBar}>
      <div className={styles.playingBarCover}>
        <Cover track={trackPlaying} noHorizontalBorder iconSize={16} />
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
