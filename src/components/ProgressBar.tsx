import { Progress } from 'radix-ui';

import styles from './ProgressBar.module.css';

type Props = {
  progress?: number;
};

export default function ProgressBar(props: Props) {
  return (
    <Progress.Root className={styles.progress} value={props.progress}>
      <Progress.Indicator
        className={styles.progressBar}
        style={{ width: `${props.progress}%` }}
      />
    </Progress.Root>
  );
}
