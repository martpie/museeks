import * as React from 'react';
import cx from 'classnames';

import * as styles from './Toast.css';

interface Props {
  type: 'danger' | 'info' | 'warning' | 'success';
  content: string;
}

const ToastItem: React.FC<Props> = (props) => {
  const { type, content } = props;

  const classes = cx(styles.toast, {
    [styles.toastSuccess]: type === 'success',
    [styles.toastWarning]: type === 'warning',
    [styles.toastDanger]: type === 'danger',
    [styles.toastInfo]: type === 'info'
  });

  return (
    <div className={classes}>
      {content}
    </div>
  );
};

export default ToastItem;
