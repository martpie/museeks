import * as stylex from '@stylexjs/stylex';

export default function Separator() {
  return <hr sx={styles.separator} />;
}

const styles = stylex.create({
  separator: {
    width: '100%',
    borderStyle: 'none',
    borderWidth: '0',
    backgroundColor: 'var(--border-color)',
    height: '1px',
    margin: '0',
  },
});
