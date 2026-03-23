import * as stylex from '@stylexjs/stylex';
import {
  type RegisteredRouter,
  Link as RouterLink,
  type ValidateLinkOptions,
} from '@tanstack/react-router';

interface LinkProps<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> {
  linkOptions: ValidateLinkOptions<TRouter, TOptions>;
  children: React.ReactNode;
  inheritColor?: boolean;
  type?: keyof typeof typeVariants;
  'data-testid'?: string;
}

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  inheritColor?: boolean;
  type?: keyof typeof typeVariants;
  'data-testid'?: string;
}

/**
 * An element that looks visually like a link, but can also be a button
 */
export default function Link<TRouter extends RegisteredRouter, TOptions>(
  props: LinkProps<TRouter, TOptions> | ButtonProps,
): React.ReactNode;
export default function Link(props: LinkProps | ButtonProps): React.ReactNode {
  const type = props.type ?? 'bold';

  const commonProps = {
    dataTestID: props['data-testid'],
    ...stylex.props(
      styles.link,
      props.inheritColor === true && styles.inheritColor,
      typeVariants[type],
    ),
  };

  if ('linkOptions' in props) {
    return (
      <RouterLink draggable={false} {...props.linkOptions} {...commonProps}>
        {props.children}
      </RouterLink>
    );
  }

  return (
    <button onClick={props.onClick} type="button" {...commonProps}>
      {props.children}
    </button>
  );
}

const styles = stylex.create({
  link: {
    display: 'inline',
    color: 'var(--link-color)',
    textDecoration: 'none',
    borderStyle: 'none',
    borderWidth: '0',
    cursor: 'pointer',
    padding: '0',
    fontWeight: 600,
    position: 'relative',
    pointerEvents: 'all',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'var(--text-interactive-bg)',
    },
  },
  inheritColor: {
    color: 'inherit',
  },
});

const typeVariants = stylex.create({
  normal: {
    fontWeight: 'normal',
  },
  bold: {
    fontWeight: 600,
  },
});
