import React, { PureComponent } from 'react';

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
  queueCursor: number;
}

export default class Queue extends PureComponent<Props> {
  render() {
    const { queue, queueCursor } = this.props;

    const shownQueue = queue.slice(queueCursor + 1, queueCursor + 21);

    if (shownQueue.length === 0) {
      return <QueueEmpty />;
    }

    return <QueueList {...this.props} />;
  }
}
