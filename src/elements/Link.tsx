import {
  type RegisteredRouter,
  Link as RouterLink,
  type ValidateLinkOptions,
} from '@tanstack/react-router';
import * as stylex from '@stylexjs/stylex';

interface LinkProps<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> {
  linkOptions: ValidateLinkOptions<TRouter, TOptions>;
  children: React.ReactNode;
  inheritColor?: boolean;
  notBold?: boolean;
}

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  inheritColor?: boolean;
  notBold?: boolean;
}

/**
 * An element that looks visually like a link, but can also be a button
 */
export default function Link<TRouter extends RegisteredRouter, TOptions>(
  props: LinkProps<TRouter, TOptions> | ButtonProps,
): React.ReactNode;
export default function Link(props: LinkProps | ButtonProps): React.ReactNode {
  const sharedClassName = stylex.props(
    styles.link,
    props.inheritColor === true && styles.inheritColor,
    props.notBold === true && styles.notBold,
  ).className;

  if ('linkOptions' in props) {
    return (
      <RouterLink
        {...props.linkOptions}
        draggable={false}
        className={sharedClassName}
      >
        {props.children}
      </RouterLink>
    );
  }

  return (
    <button
      onClick={props.onClick}
      type="button"
      {...stylex.props(
        styles.link,
        props.inheritColor === true && styles.inheritColor,
        props.notBold === true && styles.notBold,
      )}
    >
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
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: '0',
    fontWeight: 600,
    transitionProperty: 'box-shadow',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease-in-out',
    position: 'relative',
    pointerEvents: 'all',
    opacity: {
      ':hover::before': '1',
    },
    '::before': {
      content: '""',
      position: 'absolute',
      inset: '0',
      backgroundColor: 'var(--text-interactive-bg)',
      borderRadius: 'var(--border-radius)',
      right: '-0.3rem',
      left: '-0.3rem',
      opacity: '0',
      transition: 'opacity 0.2s',
    },
  },
  inheritColor: {
    color: 'inherit',
  },
  notBold: {
    fontWeight: 'normal',
  },
});
