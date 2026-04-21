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
    rowGap: 0,
    columnGap: 0,
  },
  4: {
    rowGap: '4px',
    columnGap: '4px',
  },
  8: {
    rowGap: '8px',
    columnGap: '8px',
  },
  16: {
    rowGap: '16px',
    columnGap: '16px',
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
