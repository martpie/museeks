import cx from 'classnames';

import styles from './ProgressBar.module.css';

type Props = {
  progress?: number;
  animated?: boolean;
};

export default function ProgressBar(props: Props) {
  return (
    <div className={cx(styles.progress, { [styles.animated]: props.animated })}>
      <div className={styles.progressBar} style={{ width: `${props.progress}%` }}></div>
    </div>
  );
}
