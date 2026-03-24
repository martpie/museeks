import * as stylex from '@stylexjs/stylex';
import type React from 'react';

type Props = {
  children: React.ReactNode;
  ref: React.Ref<HTMLDivElement>;
} & React.HTMLAttributes<HTMLDivElement>;

export default function Scrollable(props: Props) {
  const { children, ref, ...rest } = props;

  return (
    <div {...stylex.props(styles.scrollable)} ref={ref} {...rest}>
      {children}
    </div>
  );
}

const styles = stylex.create({
  scrollable: {
    overflowY: 'auto',
  },
});
