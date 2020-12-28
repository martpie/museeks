import React from 'react';

import styles from './ViewMessage.module.css';

/**
 * Main message of a ViewMessage
 */
export const Notice: React.FC = (props) => <div className={styles.fullMessage}>{props.children}</div>;

/**
 * Sub-message of a ViewMessage, useful to add more contextual information
 */
export const Sub: React.FC = (props) => <div className={styles.subMessage}>{props.children}</div>;
