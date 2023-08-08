import PlayingBarInfos from '../PlayingBarInfo/PlayingBarInfo';
import Cover from '../Cover/Cover';
import usePlayerStore from '../../stores/usePlayerStore';
import ButtonRepeat from '../PlayerOptionsButtons/ButtonRepeat';
import ButtonShuffle from '../PlayerOptionsButtons/ButtonShuffle';
import usePlayingTrack from '../../hooks/usePlayingTrack';

import styles from './PlayingBar.module.css';

export default function PlayingBar() {
  const repeat = usePlayerStore((state) => state.repeat);
  const shuffle = usePlayerStore((state) => state.shuffle);

  const trackPlaying = usePlayingTrack();

  if (trackPlaying === null) {
    return null;
  }

  return (
    <div className={styles.playingBar}>
      <div className={styles.playingBar__cover}>
        <Cover track={trackPlaying} />
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
