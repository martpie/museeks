import * as React from 'react';

import * as styles from './ViewMessage.css';

export const Notice: React.FC = (props) => (
  <div className={styles.fullMessage}>
    {props.children}
  </div>
);

export const Sub: React.FC = (props) => (
  <div className={styles.subMessage}>
    {props.children}
  </div>
);
