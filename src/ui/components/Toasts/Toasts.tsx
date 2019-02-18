import * as React from 'react';
import { connect } from 'react-redux';

import ToastItem from '../../elements/Toast/Toast';

import { Toast } from '../../../shared/types/interfaces';
import { RootState } from '../../reducers';

import * as styles from './Toasts.css';

interface InjectedProps {
  toasts: Toast[];
}

const Toasts: React.FC<InjectedProps> = (props) => {
  return (
    <div className={styles.toasts}>
      {props.toasts.map(toast => (
        <ToastItem
          type={toast.type}
          content={toast.content}
          key={toast._id}
        />
      ))}
    </div>
  );
};

function mapStateToProps (state: RootState) {
  return { toasts: state.toasts };
}

export default connect(mapStateToProps)(Toasts);
