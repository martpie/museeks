import * as stylex from '@stylexjs/stylex';

import ToastItem from '../elements/Toast';
import useToastsStore from '../stores/useToastsStore';

export default function Toasts() {
  const toasts = useToastsStore((state) => state.toasts);
  return (
    <div {...stylex.props(styles.toasts)}>
      {toasts.map((toast) => (
        <ToastItem type={toast.type} content={toast.content} key={toast._id} />
      ))}
    </div>
  );
}

const styles = stylex.create({
  toasts: {
    position: 'fixed',
    bottom: '40px',
    right: '10px',
    width: '350px',
    zIndex: 1000,
  },
});
