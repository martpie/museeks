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
    <div {...stylex.props(styles.title)} role="status">
      {props.children}
    </div>
  );
}

/**
 * Sub-message of a ViewMessage, useful to add more contextual information
 */
export function Sub(props: Props) {
  return <div {...stylex.props(styles.subtitle)}>{props.children}</div>;
}

const styles = stylex.create({
  title: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    fontSize: '25px',
    padding: '30px',
    margin: 'auto',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '70%',
    lineHeight: 1.8,
  },
});
