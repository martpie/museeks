import * as React from 'react';

import QueueEmpty from '../QueueEmpty/QueueEmpty';
import QueueList from '../QueueList/QueueList';
import { TrackModel } from '../../../shared/types/interfaces';

import * as styles from './Queue.css';

interface Props {
  queue: TrackModel[];
  queueCursor: number | null;
}

class Queue extends React.PureComponent<Props> {
  render () {
    const { queue, queueCursor } = this.props;
    let content: React.ReactNode;

    if (queueCursor !== null) {
      const shownQueue = queue.slice(queueCursor + 1, queueCursor + 21);

      if (shownQueue.length === 0) {
        content = <QueueEmpty />;
      } else {
        content = <QueueList queue={queue} queueCursor={queueCursor} />;
      }

      return (
        <div className={`${styles.queue} text-left`}>
          {content}
        </div>
      );
    }

    return null;
  }
}

export default Queue;
