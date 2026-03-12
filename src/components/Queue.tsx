import * as stylex from '@stylexjs/stylex';
import type React from 'react';
import { useMemo } from 'react';

import type { Track } from '../generated/typings';
import QueueEmpty from './QueueEmpty';
import QueueList from './QueueList';

type Props = {
  queue: Track[];
  queueCursor: number | null;
};

export default function Queue(props: Props) {
  const { queue, queueCursor } = props;
  let content: React.ReactNode;

  const isQueueEmpty = useMemo(() => {
    if (queueCursor == null) {
      return null;
    }

    return queue.slice(queueCursor + 1).length === 0;
  }, [queue, queueCursor]);

  if (isQueueEmpty || queueCursor == null) {
    content = <QueueEmpty />;
  } else {
    content = <QueueList queue={queue} queueCursor={queueCursor} />;
  }

  return <div {...stylex.props(styles.queue)}>{content}</div>;
}

const styles = stylex.create({
  queue: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'var(--queue-bg)',
    borderLeftWidth: '1px',
    borderLeftStyle: 'solid',
    borderLeftColor: 'var(--border-color)',
    overflowX: 'hidden',
    fontSize: '12px',
    textAlign: 'left',
  },
});
