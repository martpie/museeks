import * as React from 'react';
import { NavLink } from 'react-router-dom';
import cx from 'classnames';

import * as styles from './Nav.css';

interface WrapProps {
  vertical?: boolean;
}

export const Wrap: React.FC<WrapProps> = (props) => (
  <nav className={cx(styles.nav, { [styles.navVertical]: props.vertical })}>
    {props.children}
  </nav>
);

interface LinkProps {
  to: string;
}

export const Link: React.FC<LinkProps> = (props) => (
  <NavLink
    to={props.to}
    className={styles.nav__link}
    activeClassName={styles.nav__linkActive}
    draggable={false}
  >
    {props.children}
  </NavLink>
);
