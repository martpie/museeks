import { Link } from '@tanstack/react-router';
import cx from 'classnames';
import type React from 'react';

import styles from './SettingsNav.module.css';

interface WrapProps {
  children: React.ReactNode;
}

/**
 * Wrapper for navigation
 */
export function SettingsNav(props: WrapProps) {
  return <nav className={cx(styles.nav)}>{props.children}</nav>;
}

interface LinkProps {
  children: React.ReactNode;
  to: string;
}

/**
 * Single navigation item (anchor)
 */
export function SettingsNavLink(props: LinkProps) {
  return (
    <Link
      to={props.to}
      className={styles.navLink}
      activeProps={{ className: styles.navLinkActive }}
      draggable={false}
    >
      {props.children}
    </Link>
  );
}
