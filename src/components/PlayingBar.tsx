import type { Track } from '../generated/typings';
import usePlayerStore from '../stores/usePlayerStore';
import ButtonRepeat from './ButtonRepeat';
import ButtonShuffle from './ButtonShuffle';
import Cover from './Cover';
import styles from './PlayingBar.module.css';
import PlayingBarInfos from './PlayingBarInfo';

type Props = {
  trackPlaying: Track;
};

export default function PlayingBar(props: Props) {
  const repeat = usePlayerStore((state) => state.repeat);
  const shuffle = usePlayerStore((state) => state.shuffle);
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
