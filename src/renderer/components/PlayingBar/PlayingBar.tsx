import { useState } from 'react';
import Icon from 'react-fontawesome';
import cx from 'classnames';
import useClickOut from '@bscop/use-click-out';

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

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const clickOutRef = useClickOut<HTMLDivElement>(() => {
    setIsQueueOpen(false);
  });

  const queueContainerClasses = cx(styles.queueContainer, {
    [styles.isOpen]: isQueueOpen,
  });

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
      <div className={styles.playingBar__queue} ref={clickOutRef}>
        <button
          onClick={() => setIsQueueOpen(!isQueueOpen)}
          className={styles.queueToggle}
        >
          <Icon name="list" />
        </button>
        <div className={queueContainerClasses}>
          <Queue queue={queue} queueCursor={queueCursor} />
        </div>
      </div>
    </div>
  );
}
