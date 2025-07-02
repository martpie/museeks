import React from 'react';

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
  return (
    <div className={styles.sideNav} data-museeks-list>
      <Flexbox gap={8} align="center">
        <h4 className={styles.sideNavTitle}>{props.title}</h4>
        <div className={styles.sideNavActions}>{props.actions}</div>
      </Flexbox>
      <div className={styles.sideNavItems}>
        {/*
          Custom Rendering so we can display single letters to help visually
          grouping items on very long lists
        */}
        {React.Children.map(props.children, (child, index) => {
          const previousChild = props.children[index - 1];

          const previousChar = previousChild?.props.label[0];
          const currentChar = child.props.label[0];

          const isNewSection =
            previousChild === undefined ||
            stripAccents(previousChar.toLowerCase()) !==
              stripAccents(currentChar.toLowerCase());

          return (
            <React.Fragment key={child.props.id}>
              {isNewSection && (
                <div className={styles.letter}>{stripAccents(currentChar)}</div>
              )}
              {child}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
