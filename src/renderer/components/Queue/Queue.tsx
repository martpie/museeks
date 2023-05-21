import React from 'react';

import QueueEmpty from '../QueueEmpty/QueueEmpty';
import QueueList from '../QueueList/QueueList';
import { TrackModel } from '../../../shared/types/museeks';

import styles from './Queue.module.css';

type Props = {
  queue: TrackModel[];
  queueCursor: number | null;
};

function Queue(props: Props) {
  const { queue, queueCursor } = props;
  let content: React.ReactNode;

  if (queueCursor !== null) {
    const shownQueue = queue.slice(queueCursor + 1, queueCursor + 21);

    if (shownQueue.length === 0) {
      content = <QueueEmpty />;
    } else {
      content = <QueueList queue={queue} queueCursor={queueCursor} />;
    }

    return <div className={`${styles.queue} text-left`}>{content}</div>;
  }

  return null;
}

export default Queue;
