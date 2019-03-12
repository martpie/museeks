import * as React from 'react';
import cx from 'classnames';

import * as styles from './Button.css';

interface Props {
  relevancy?: 'danger';
  bSize?: 'small';
}

const Button: React.FC<Props & React.HTMLProps<HTMLButtonElement>> = (props) => {
  const { relevancy, bSize, ...rest } = props;

  const classes = cx(styles.button, {
    [styles.danger]: relevancy === 'danger',
    [styles.small]: bSize === 'small'
  });

  return (
    <button className={classes} {...rest}>
      {props.children}
    </button>
  );
};

export default Button;
