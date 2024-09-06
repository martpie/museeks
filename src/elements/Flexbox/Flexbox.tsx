import cx from 'classnames';

import styles from './Flexbox.module.css';

type Props = {
  gap?: 4 | 8 | 16;
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  align?: 'center';
};

export default function Flexbox(props: Props) {
  const classNames = cx(styles.flexbox, {
    [styles.vertical]: props.direction === 'vertical',
  });

  return (
    <div
      className={classNames}
      style={{
        gap: props.gap ?? 0,
        alignItems: props.align,
      }}
    >
      {props.children}
    </div>
  );
}
