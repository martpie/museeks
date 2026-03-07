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
  if ('linkOptions' in props) {
    return (
      <RouterLink
        {...props.linkOptions}
        draggable={false}
        sx={[
          styles.link,
          props.inheritColor === true && styles.inheritColor,
          props.notBold === true && styles.notBold,
        ]}
      >
        {props.children}
      </RouterLink>
    );
  }

  return (
    <button
      onClick={props.onClick}
      type="button"
      sx={[
        styles.link,
        props.inheritColor === true && styles.inheritColor,
        props.notBold === true && styles.notBold,
      ]}
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
  notBold: {
    fontWeight: 'normal',
  },
});
