import { NavigationMenu } from '@base-ui/react/navigation-menu';
import * as stylex from '@stylexjs/stylex';
import { groupBy } from 'lodash-es';
import React, { useMemo } from 'react';

import Flexbox from '../elements/Flexbox';
import { stripAccents } from '../lib/utils-library';
import type { SideNavLinkProps } from './SideNavLink';

type Props = {
  children: Array<React.ReactElement<SideNavLinkProps>>;
  title: string;
  actions?: React.ReactNode;
  bottomContent?: React.ReactNode;
};

export default function SideNav(props: Props) {
  // Let's group the children by first character
  const groupedChildren = useMemo(() => {
    const groups = groupBy(props.children, (child) => {
      const stripped = stripAccents(child.props.label[0]).toUpperCase();
      const code = stripped.charCodeAt(0);

      // Group under # if the first character is not a letter
      return code >= 65 && code <= 90 ? stripped : '#';
    });

    return groups;
  }, [props.children]);

  return (
    <div {...stylex.props(styles.nav)} data-museeks-list>
      <Flexbox gap={8} align="center" xstyle={styles.header}>
        <h4 {...stylex.props(styles.title)}>{props.title}</h4>
        <div {...stylex.props(styles.actions)}>{props.actions}</div>
      </Flexbox>
      <NavigationMenu.Root orientation="vertical">
        <NavigationMenu.List {...stylex.props(styles.content)}>
          {Object.entries(groupedChildren).map(([letter, children]) => {
            return (
              <React.Fragment key={letter}>
                <div
                  {...stylex.props(styles.letter)}
                  data-testid="sidenav-letter-group"
                >
                  {letter}
                </div>
                <div {...stylex.props(styles.items)}>{children}</div>
              </React.Fragment>
            );
          })}
          {props.bottomContent && (
            <>
              {/** should probably be a prop */}
              <div {...stylex.props(styles.letter)}>///</div>
              {props.bottomContent}
            </>
          )}
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </div>
  );
}

const styles = stylex.create({
  nav: {
    display: 'flex',
    flexFlow: 'column',
    flexShrink: 0,
    width: '220px',
    borderRightWidth: '1px',
    borderRightStyle: 'solid',
    borderRightColor: 'var(--border-color)',
    backgroundColor: 'var(--sidebar-bg)',
    maxHeight: '100%',
    overflowY: 'auto',
    position: 'relative',
    top: 0,
  },
  header: {
    zIndex: 10,
    position: 'sticky',
    top: 0,
    backgroundColor: 'var(--sidebar-bg)',
  },
  actions: {
    alignItems: 'stretch',
    marginRight: '8px',
  },
  title: {
    marginBlock: '10px',
    marginInline: '12px',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    color: 'var(--text-muted)',
    flex: '1',
  },
  content: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  letter: {
    display: 'block',
    paddingBlock: '8px',
    paddingInline: '12px',
    textTransform: 'uppercase',
    fontWeight: 'bolder',
    position: 'sticky',
    top: '32px',
    backgroundColor: 'var(--sidebar-bg)',
    color: 'var(--text-muted)',
  },
  items: {
    display: 'block',
    marginBottom: '12px',
  },
});
