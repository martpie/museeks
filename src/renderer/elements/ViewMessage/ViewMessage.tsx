import React from 'react';

import styles from './ViewMessage.module.css';

type Props = {
  children: React.ReactNode;
};

/**
 * Main message of a ViewMessage
 */
export const Notice: React.FC<Props> = (props) => <div className={styles.fullMessage}>{props.children}</div>;

/**
 * Sub-message of a ViewMessage, useful to add more contextual information
 */
export const Sub: React.FC<Props> = (props) => <div className={styles.subMessage}>{props.children}</div>;
