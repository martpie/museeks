import * as stylex from '@stylexjs/stylex';
import { Link } from '@tanstack/react-router';
import { NavigationMenu } from 'radix-ui';
import type React from 'react';

interface WrapProps {
  children: React.ReactNode;
}

/**
 * Wrapper for navigation
 */
export function SettingsNav(props: WrapProps) {
  return (
    <NavigationMenu.Root orientation="vertical">
      <NavigationMenu.List {...stylex.props(styles.nav)}>
        {props.children}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
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
    <NavigationMenu.Item>
      <NavigationMenu.Link asChild>
        <Link
          to={props.to}
          {...stylex.props(styles.navLink)}
          draggable={false}
          data-testid={`settings-nav-link${props.to}`}
        >
          {props.children}
        </Link>
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  );
}

const styles = stylex.create({
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    listStyle: 'none',
    margin: 0,
    padding: 0,
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
