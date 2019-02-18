import * as React from 'react';
import cx from 'classnames';

import * as styles from './ProgressBar.css';

interface Props {
  progress?: number;
  animated?: boolean;
}

const ProgressBar: React.FC<Props> = (props) => (
  <div className={cx(styles.progress, { [styles.animated]: props.animated })}>
    <div
      className={styles.progressBar}
      style={{ width: `${props.progress}%` }}
    ></div>
  </div>
);

ProgressBar.defaultProps = {
  progress: 100,
  animated: false
};

export default ProgressBar;
