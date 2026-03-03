import * as stylex from '@stylexjs/stylex';

type Props = {
  type: 'danger' | 'info' | 'warning' | 'success';
  content: string;
};

/**
 * Toast single item
 */
export default function ToastItem(props: Props) {
  const { type, content } = props;

  return (
    <div
      {...stylex.props(
        styles.toast,
        type === 'success' && styles.toastSuccess,
        type === 'warning' && styles.toastWarning,
        type === 'danger' && styles.toastDanger,
        type === 'info' && styles.toastInfo,
      )}
    >
      {content}
    </div>
  );
}

const styles = stylex.create({
  toast: {
    borderStyle: 'solid',
    borderWidth: '1px',
    borderLeftWidth: '5px',
    backgroundColor: 'var(--toasts-bg)',
    borderTopColor: 'var(--border-color)',
    borderRightColor: 'var(--border-color)',
    borderBottomColor: 'var(--border-color)',
    borderRadius: 'var(--border-radius)',
    color: 'var(--text)',
    boxShadow: '0 5px 3px -5px rgba(0 0 0 0.5)',
    padding: '15px',
    marginTop: {
      ':not(:first-child)': '5px',
    },
  },
  toastSuccess: {
    borderLeftColor: 'var(--success-color)',
  },
  toastInfo: {
    borderLeftColor: 'var(--info-color)',
  },
  toastWarning: {
    borderLeftColor: 'var(--warning-color)',
  },
  toastDanger: {
    borderLeftColor: 'var(--danger-color)',
  },
});
