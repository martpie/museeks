import cx from 'classnames';

import styles from './Flexbox.module.css';

type Props = {
  gap?: 4 | 8 | 16;
  children: React.ReactNode;
  className?: string;
  direction?: 'vertical' | 'horizontal';
  align?: 'center' | 'baseline';
};

export default function Flexbox(props: Props) {
  const classNames = cx(styles.flexbox, props.className, {
    [styles.vertical]: props.direction === 'vertical',
  });

  return (
    <div
      className={classNames}
      style={{
        gap: props.gap ?? 0,
        alignItems: props.align,
      }} // Eventually, move that to real classes, but I am lazy
    >
      {props.children}
    </div>
  );
}
