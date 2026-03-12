import * as stylex from '@stylexjs/stylex';

type Props = {
  gap?: keyof typeof gapVariants;
  children: React.ReactNode;
  xstyle?: stylex.CompiledStyles;
  direction?: keyof typeof directionVariants;
  align?: keyof typeof alignVariants;
};

export default function Flexbox(props: Props) {
  const { direction = 'horizontal' } = props;

  return (
    <div
      {...stylex.props(
        styles.flexbox,
        directionVariants[direction],
        props.gap !== undefined ? gapVariants[props.gap] : null,
        props.align ? alignVariants[props.align] : null,
        props.xstyle,
      )}
    >
      {props.children}
    </div>
  );
}

const styles = stylex.create({
  flexbox: {
    display: 'flex',
  },
});

const directionVariants = stylex.create({
  horizontal: {
    flexDirection: 'row',
  },
  vertical: {
    flexDirection: 'column',
  },
});

const gapVariants = stylex.create({
  0: {
    gap: 0,
  },
  4: {
    gap: '4px',
  },
  8: {
    gap: '8px',
  },
  16: {
    gap: '16px',
  },
});

const alignVariants = stylex.create({
  center: {
    alignItems: 'center',
  },
  baseline: {
    alignItems: 'baseline',
  },
});
