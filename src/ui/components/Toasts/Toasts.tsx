import * as React from 'react';
import { connect } from 'react-redux';

import ToastItem from './ToastItem';

import { Toast } from '../../../shared/types/interfaces';
import { RootState } from '../../reducers';

/*
|--------------------------------------------------------------------------
| Toasts
|--------------------------------------------------------------------------
*/

interface InjectedProps {
  toasts: Toast[];
}

const Toasts: React.FunctionComponent<InjectedProps> = (props) => {
  return (
    <div className='toasts'>
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
