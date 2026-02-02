import {
  type RegisteredRouter,
  Link as RouterLink,
  type ValidateLinkOptions,
} from '@tanstack/react-router';
import cx from 'classnames';

import styles from './Link.module.css';

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
  const classNames = cx(styles.link, {
    [styles.inheritColor]: props.inheritColor === true,
    [styles.notBold]: props.notBold === true,
  });

  if ('linkOptions' in props) {
    return (
      <RouterLink
        {...props.linkOptions}
        draggable={false}
        className={classNames}
      >
        {props.children}
      </RouterLink>
    );
  }

  return (
    <button className={classNames} onClick={props.onClick} type="button">
      {props.children}
    </button>
  );
}
