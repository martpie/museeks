import * as stylex from '@stylexjs/stylex';

type Props = {
  gap?: keyof typeof gapVariants;
  children: React.ReactNode;
  sx?: stylex.CompiledStyles;
  direction?: keyof typeof directionVariants;
  align?: keyof typeof alignVariants;
};

export default function Flexbox(props: Props) {
  return (
    <div
      sx={[
        styles.flexbox,
        directionVariants[props.direction ?? 'horizontal'],
        gapVariants[props.gap ?? 0],
        props.align ? alignVariants[props.align] : null,
        props.sx,
      ]}
    >
      {props.children}
    </div>
  );
}

// -----------------------------------------------------------------------------

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
