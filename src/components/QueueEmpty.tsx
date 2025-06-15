import { Trans } from '@lingui/react/macro';
import styles from './QueueEmpty.module.css';

export default function QueueEmpty() {
  return (
    <div className={`${styles.queueEmpty} text-center`}>
      <Trans>Queue is empty</Trans>
    </div>
  );
}
