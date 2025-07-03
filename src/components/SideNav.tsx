import { groupBy } from 'lodash-es';
import React, { useMemo } from 'react';

import Flexbox from '../elements/Flexbox';
import { stripAccents } from '../lib/utils-library';
import styles from './SideNav.module.css';
import type { SideNavLinkProps } from './SideNavLink';

type Props = {
  children: Array<React.ReactElement<SideNavLinkProps>>;
  title: string;
  actions?: React.ReactNode;
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
    <div className={styles.nav} data-museeks-list>
      <Flexbox gap={8} align="center" className={styles.header}>
        <h4 className={styles.title}>{props.title}</h4>
        <div className={styles.actions}>{props.actions}</div>
      </Flexbox>
      <div className={styles.content}>
        {Object.entries(groupedChildren).map(([letter, children]) => {
          return (
            <React.Fragment key={letter}>
              <div className={styles.letter}>{letter}</div>
              <div className={styles.items}>{children}</div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
