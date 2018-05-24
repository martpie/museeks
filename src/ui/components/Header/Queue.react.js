import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import QueueEmpty from './QueueEmpty.react';
import QueueList from './QueueList.react';


/*
|--------------------------------------------------------------------------
| Header - Queue
|--------------------------------------------------------------------------
*/

export default class Queue extends PureComponent {
  static propTypes = {
    queue: PropTypes.array.isRequired,
    queueCursor: PropTypes.number.isRequired,
  }

  render() {
    const { queue, queueCursor } = this.props;

    const shownQueue = queue.slice(queueCursor + 1, queueCursor + 21);

    if (shownQueue.length === 0) {
      return <QueueEmpty />;
    }

    return <QueueList {...this.props} />;
  }
}
