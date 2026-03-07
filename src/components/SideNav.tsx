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
    const groups = groupBy(props.children, (child) =>
      stripAccents(child.props.label[0].toUpperCase()),
    );

    return groups;
  }, [props.children]);

  return (
    <div sx={styles.nav} data-museeks-list>
      <Flexbox gap={8} align="center" sx={styles.header}>
        <h4 sx={styles.title}>{props.title}</h4>
        <div sx={styles.actions}>{props.actions}</div>
      </Flexbox>
      <div sx={styles.content}>
        {Object.entries(groupedChildren).map(([letter, children]) => {
          return (
            <React.Fragment key={letter}>
              <div sx={styles.letter}>{letter}</div>
              <div sx={styles.items}>{children}</div>
            </React.Fragment>
          );
        })}
        {props.bottomContent && (
          <>
            {/** should probably be a prop */}
            <div sx={styles.letter}>#</div>
            {props.bottomContent}
          </>
        )}
      </div>
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
