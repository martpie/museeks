import React from 'react';
import { NavLink } from 'react-router-dom';
import cx from 'classnames';

import styles from './Nav.module.css';

interface WrapProps {
  children: React.ReactNode;
  vertical?: boolean;
}

/**
 * Wrapper for navigation
 */
export function Wrap(props: WrapProps) {
  return (
    <nav className={cx(styles.nav, { [styles.navVertical]: props.vertical })}>
      {props.children}
    </nav>
  );
}

interface LinkProps {
  children: React.ReactNode;
  to: string;
}

/**
 * Single navigation item (anchor)
 */
export function Link(props: LinkProps) {
  return (
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        `${styles.nav__link} ${isActive && styles.nav__linkActive}`
      }
      draggable={false}
    >
      {props.children}
    </NavLink>
  );
}
