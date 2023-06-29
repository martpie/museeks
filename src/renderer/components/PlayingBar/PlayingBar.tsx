import Icon from 'react-fontawesome';
import * as Popover from '@radix-ui/react-popover';

import Queue from '../Queue/Queue';
import PlayingBarInfos from '../PlayingBarInfo/PlayingBarInfo';
import Cover from '../Cover/Cover';
import usePlayerStore from '../../stores/usePlayerStore';

import styles from './PlayingBar.module.css';

export default function PlayingBar() {
  const repeat = usePlayerStore((state) => state.repeat);
  const shuffle = usePlayerStore((state) => state.shuffle);
  const queue = usePlayerStore((state) => state.queue);
  const queueCursor = usePlayerStore((state) => state.queueCursor);

  if (queueCursor === null) return null;

  const trackPlaying = queue[queueCursor];

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
      <div className={styles.playingBar__queue}>
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className={styles.queueToggle}>
              <Icon name="list" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="bottom"
              sideOffset={8}
              align="end"
              alignOffset={-10}
              avoidCollisions={false}
              className={styles.queueContainer}
            >
              <Queue queue={queue} queueCursor={queueCursor} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  );
}
