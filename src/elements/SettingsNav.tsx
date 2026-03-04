import * as stylex from '@stylexjs/stylex';
import { Link } from '@tanstack/react-router';
import type React from 'react';

interface WrapProps {
  children: React.ReactNode;
}

/**
 * Wrapper for navigation
 */
export function SettingsNav(props: WrapProps) {
  return <nav {...stylex.props(styles.nav)}>{props.children}</nav>;
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
      {...stylex.props(styles.navLink)}
      draggable={false}
      data-testid={`settings-nav-link${props.to}`}
    >
      {props.children}
    </Link>
  );
}

const styles = stylex.create({
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  navLink: {
    display: 'inline-block',
    fontWeight: 'bold',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    textDecorationLine: 'none',
    color: {
      default: 'var(--text)',
      ':is([data-status="active"])': 'var(--main-color)',
    },
  },
});
