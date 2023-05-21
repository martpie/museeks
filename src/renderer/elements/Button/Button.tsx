import cx from 'classnames';

import styles from './Button.module.css';

type Props = {
  relevancy?: 'danger';
  bSize?: 'small';
};

export default function Button(props: Props & JSX.IntrinsicElements['button']) {
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
