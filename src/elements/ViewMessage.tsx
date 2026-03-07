import * as stylex from '@stylexjs/stylex';
import type React from 'react';

type Props = {
  children: React.ReactNode;
};

/**
 * Main message of a ViewMessage
 */
export function Notice(props: Props) {
  return (
    <div sx={styles.fullMessage} data-testid="view-message">
      {props.children}
    </div>
  );
}

/**
 * Sub-message of a ViewMessage, useful to add more contextual information
 */
export function Sub(props: Props) {
  return <div sx={styles.subMessage}>{props.children}</div>;
}

const styles = stylex.create({
  fullMessage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    fontSize: '25px',
    padding: '30px',
    margin: 'auto',
    textAlign: 'center',
  },
  subMessage: {
    fontSize: '70%',
    lineHeight: 1.8,
  },
});
