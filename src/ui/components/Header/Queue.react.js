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
    queue: PropTypes.array,
    queueCursor: PropTypes.number,
    visible: PropTypes.bool,
  }

  constructor(props) {
    super(props);
  }

  render() {
    const queue       = this.props.queue;
    const queueCursor = this.props.queueCursor;

    const shownQueue = queue.slice(queueCursor + 1, queueCursor + 21);

    if(shownQueue.length === 0) {
      return <QueueEmpty />;
    }

    return <QueueList {...this.props} />;
  }
}
