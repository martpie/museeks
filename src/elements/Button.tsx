import * as stylex from '@stylexjs/stylex';

type Props = {
  relevancy?: keyof typeof relevancyVariants;
  bSize?: keyof typeof sizeVariants;
  block?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button(props: Props) {
  const { relevancy = 'default', bSize = 'default', block, ...rest } = props;

  return (
    <button
      type="button"
      {...rest}
      {...stylex.props(
        styles.button,
        relevancyVariants[relevancy],
        sizeVariants[bSize],
        block && styles.block,
      )}
    >
      {props.children}
    </button>
  );
}

const styles = stylex.create({
  button: {
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
  block: {
    display: 'block',
    width: '100%',
  },
});

const relevancyVariants = stylex.create({
  default: {
    backgroundColor: 'var(--button-bg)',
    color: 'var(--button-color)',
  },
  danger: {
    color: 'white',
    backgroundColor: '#b63333',
  },
});

const sizeVariants = stylex.create({
  default: {
    paddingBlock: '6px',
    paddingInline: '8px',
  },
  small: {
    paddingBlock: '1px',
    paddingInline: '5px',
    fontSize: '10px',
  },
});
