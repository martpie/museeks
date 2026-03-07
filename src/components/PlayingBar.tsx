import * as stylex from '@stylexjs/stylex';

import type { Track } from '../generated/typings';
import { usePlayerState } from '../hooks/usePlayer';
import ButtonRepeat from './ButtonRepeat';
import ButtonShuffle from './ButtonShuffle';
import Cover from './Cover';
import PlayingBarInfos from './PlayingBarInfo';

type Props = {
  trackPlaying: Track;
};

export default function PlayingBar(props: Props) {
  const repeat = usePlayerState((state) => state.repeat);
  const shuffle = usePlayerState((state) => state.shuffle);
  const trackPlaying = props.trackPlaying;

  return (
    <div sx={styles.playingBar}>
      <div sx={styles.playingBarCover}>
        <Cover track={trackPlaying} noHorizontalBorder iconSize={16} />
      </div>
      <PlayingBarInfos
        trackPlaying={trackPlaying}
        shuffle={shuffle}
        repeat={repeat}
      />
      <div sx={styles.playerOptions}>
        <ButtonRepeat />
        <ButtonShuffle />
      </div>
    </div>
  );
}

const styles = stylex.create({
  playingBar: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    height: '100%',
    backgroundColor: 'var(--header-bg-softer)',
    borderRightWidth: '1px',
    borderRightStyle: 'solid',
    borderRightColor: 'var(--border-color-softer)',
    borderBlockWidth: '0',
    borderInlineWidth: '1px',
    flex: '1 1 auto',
    minWidth: 0,
  },
  playingBarCover: {
    flexShrink: 0,
    height: '100%',
    aspectRatio: '1',
    overflow: 'hidden',
    boxSizing: 'content-box',
    fontSize: '28px',
  },
  playerOptions: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    marginRight: '8px',
  },
});
