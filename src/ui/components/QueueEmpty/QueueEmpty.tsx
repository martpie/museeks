import * as React from 'react';

import * as styles from './QueueEmpty.css';

export default class QueueEmpty extends React.PureComponent {
  render () {
    return (
      <div className={`${styles.queue__empty} text-center`}>
        queue is empty
      </div>
    );
  }
}
