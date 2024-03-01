import React from 'react';

import styles from './ViewMessage.module.css';

type Props = {
  children: React.ReactNode;
};

/**
 * Main message of a ViewMessage
 */
export function Notice(props: Props) {
  return <div className={styles.fullMessage}>{props.children}</div>;
}

/**
 * Sub-message of a ViewMessage, useful to add more contextual information
 */
export function Sub(props: Props) {
  return <div className={styles.subMessage}>{props.children}</div>;
}
