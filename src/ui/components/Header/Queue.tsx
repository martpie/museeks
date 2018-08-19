import * as React from 'react';

import QueueEmpty from './QueueEmpty';
import QueueList from './QueueList';
import { TrackModel } from '../../typings/interfaces';


/*
|--------------------------------------------------------------------------
| Header - Queue
|--------------------------------------------------------------------------
*/

interface Props {
  queue: TrackModel[];
  queueCursor: number | null;
}

export default class Queue extends React.PureComponent<Props> {
  render() {
    const { queue, queueCursor } = this.props;

    if (queueCursor !== null) {
      const shownQueue = queue.slice(queueCursor + 1, queueCursor + 21);

      if (shownQueue.length === 0) {
        return <QueueEmpty />;
      }

      return <QueueList queue={queue} queueCursor={queueCursor} />;
    }

    return null;
  }
}
