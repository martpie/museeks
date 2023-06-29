import React, { useMemo } from 'react';

import QueueEmpty from '../QueueEmpty/QueueEmpty';
import QueueList from '../QueueList/QueueList';
import { TrackModel } from '../../../shared/types/museeks';

import styles from './Queue.module.css';

const QUEUE_SIZE = 20;

type Props = {
  queue: TrackModel[];
  queueCursor: number | null;
};

export default function Queue(props: Props) {
  const { queue, queueCursor } = props;
  let content: React.ReactNode;

  const shownQueue = useMemo(() => {
    if (queueCursor == null) {
      return null;
    }

    return queue.slice(queueCursor + 1, queueCursor + QUEUE_SIZE + 1);
  }, [queue, queueCursor]);

  if (shownQueue !== null && queueCursor !== null) {
    if (shownQueue.length === 0) {
      content = <QueueEmpty />;
    } else {
      content = <QueueList queue={queue} queueCursor={queueCursor} />;
    }

    return <div className={`${styles.queue} text-left`}>{content}</div>;
  }

  return null;
}
