import React from 'react';

import styles from './QueueEmpty.module.css';

export default class QueueEmpty extends React.PureComponent {
  render() {
    return <div className={`${styles.queue__empty} text-center`}>queue is empty</div>;
  }
}
