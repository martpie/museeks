import * as stylex from '@stylexjs/stylex';

type Props = {
  type: keyof typeof typeVariantsStyles;
  content: string;
};

/**
 * Toast single item
 */
export default function ToastItem(props: Props) {
  const { type, content } = props;

  return <div sx={[styles.toast, typeVariantsStyles[type]]}>{content}</div>;
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
});

const typeVariantsStyles = stylex.create({
  success: {
    borderLeftColor: 'var(--success-color)',
  },
  info: {
    borderLeftColor: 'var(--info-color)',
  },
  warning: {
    borderLeftColor: 'var(--warning-color)',
  },
  danger: {
    borderLeftColor: 'var(--danger-color)',
  },
});
