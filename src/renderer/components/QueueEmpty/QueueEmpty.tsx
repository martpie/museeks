import React from 'react';

import styles from './QueueEmpty.module.css';

const QueueEmpty: React.FC = () => {
  return <div className={`${styles.queue__empty} text-center`}>queue is empty</div>;
};

export default QueueEmpty;
