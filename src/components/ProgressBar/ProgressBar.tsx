import * as Progress from '@radix-ui/react-progress';
import cx from 'classnames';

import styles from './ProgressBar.module.css';

type Props = {
  progress?: number;
  animated?: boolean;
};

export default function ProgressBar(props: Props) {
  return (
    <Progress.Root
      className={cx(styles.progress, { [styles.animated]: props.animated })}
      value={props.progress}
    >
      <Progress.Indicator
        className={styles.progressBar}
        style={{ width: `${props.progress}%` }}
      />
    </Progress.Root>
  );
}
