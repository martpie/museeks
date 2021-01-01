import React from 'react';
import { NavLink } from 'react-router-dom';
import cx from 'classnames';

import styles from './Nav.module.css';

interface WrapProps {
  vertical?: boolean;
}

/**
 * Wrapper for navigation
 */
export const Wrap: React.FC<WrapProps> = (props) => (
  <nav className={cx(styles.nav, { [styles.navVertical]: props.vertical })}>{props.children}</nav>
);

interface LinkProps {
  to: string;
}

/**
 * Single navigation item (anchor)
 */
export const Link: React.FC<LinkProps> = (props) => (
  <NavLink to={props.to} className={styles.nav__link} activeClassName={styles.nav__linkActive} draggable={false}>
    {props.children}
  </NavLink>
);
