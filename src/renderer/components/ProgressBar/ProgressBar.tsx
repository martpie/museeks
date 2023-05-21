import cx from 'classnames';

import styles from './ProgressBar.module.css';

type Props = {
  progress?: number;
  animated?: boolean;
};

function ProgressBar(props: Props) {
  return (
    <div className={cx(styles.progress, { [styles.animated]: props.animated })}>
      <div className={styles.progressBar} style={{ width: `${props.progress}%` }}></div>
    </div>
  );
}

export default ProgressBar;
