import * as stylex from '@stylexjs/stylex';

/**
 * ♥
 */
export default function Heart() {
  return <span sx={styles.heart}>♥</span>;
}

const styles = stylex.create({
  heart: {
    color: '#c70000',
  },
});
