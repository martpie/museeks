import { useSelector } from 'react-redux';

import ToastItem from '../../elements/Toast/Toast';
import { RootState } from '../../store/reducers';

import styles from './Toasts.module.css';

export default function Toasts() {
  const toasts = useSelector((state: RootState) => state.toasts);
  return (
    <div className={styles.toasts}>
      {toasts.map((toast) => (
        <ToastItem type={toast.type} content={toast.content} key={toast._id} />
      ))}
    </div>
  );
}
