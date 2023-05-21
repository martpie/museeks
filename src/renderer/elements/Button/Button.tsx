import cx from 'classnames';

import styles from './Button.module.css';

interface Props {
  relevancy?: 'danger';
  bSize?: 'small';
}

function Button(props: Props & JSX.IntrinsicElements['button']) {
  const { relevancy, bSize, ...rest } = props;

  const classes = cx(styles.button, {
    [styles.danger]: relevancy === 'danger',
    [styles.small]: bSize === 'small',
  });

  return (
    <button className={classes} {...rest}>
      {props.children}
    </button>
  );
}

export default Button;
