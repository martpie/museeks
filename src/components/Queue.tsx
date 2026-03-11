import * as stylex from '@stylexjs/stylex';
import type React from 'react';

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

  const isQueueEmpty =
    queueCursor == null ? null : queue.slice(queueCursor + 1).length === 0;

  if (isQueueEmpty || queueCursor == null) {
    content = <QueueEmpty />;
  } else {
    content = <QueueList queue={queue} queueCursor={queueCursor} />;
  }

  return <div {...stylex.props(styles.queue)}>{content}</div>;
}

const styles = stylex.create({
  queue: {
    width: '300px',
    backgroundColor: 'var(--queue-bg)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border-color)',
    borderRadius: 'var(--border-radius)',
    textOverflow: 'ellipsis',
    overflowX: 'hidden',
    fontSize: '12px',
    boxShadow: '0 5px 3px -5px rgba(0 0 0 0.5)',
    textAlign: 'left',
  },
});
