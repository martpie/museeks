import * as stylex from '@stylexjs/stylex';

type Props = {
  relevancy?: 'danger';
  bSize?: 'small';
  block?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button(props: Props) {
  const { relevancy, bSize, block, ...rest } = props;

  return (
    <button
      type="button"
      {...rest}
      sx={[
        styles.button,
        relevancy === 'danger' && styles.danger,
        bSize === 'small' && styles.small,
        block && styles.block,
      ]}
    >
      {props.children}
    </button>
  );
}

const styles = stylex.create({
  button: {
    backgroundColor: 'var(--button-bg)',
    color: 'var(--button-color)',
    paddingBlock: '6px',
    paddingInline: '8px',
    borderRadius: 'var(--border-radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'var(--button-border)',
    cursor: 'pointer',
    boxSizing: 'border-box',
    opacity: {
      ':active': 0.7,
      ':disabled': 0.5,
    },
  },
  danger: {
    color: 'white',
    backgroundColor: '#b63333',
  },
  small: {
    fontSize: '10px',
    paddingBlock: '1px',
    paddingInline: '5px',
  },
  block: {
    display: 'block',
    width: '100%',
  },
});
