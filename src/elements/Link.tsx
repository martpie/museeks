import {
  type RegisteredRouter,
  Link as RouterLink,
  type ValidateLinkOptions,
} from '@tanstack/react-router';

import styles from './Link.module.css';

interface LinkProps<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> {
  linkOptions: ValidateLinkOptions<TRouter, TOptions>;
  children: React.ReactNode;
}

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
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
        to={props.linkOptions.href}
        draggable={false}
        className={styles.link}
      >
        {props.children}
      </RouterLink>
    );
  }

  return (
    <button className={styles.link} onClick={props.onClick} type="button">
      {props.children}
    </button>
  );
}
