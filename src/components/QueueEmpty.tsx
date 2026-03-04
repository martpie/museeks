import { Trans } from '@lingui/react/macro';
import * as stylex from '@stylexjs/stylex';

export default function QueueEmpty() {
  return (
    <div {...stylex.props(styles.queueEmpty)}>
      <Trans>Queue is empty</Trans>
    </div>
  );
}

const styles = stylex.create({
  queueEmpty: {
    padding: '20px',
    textAlign: 'center',
  },
});
