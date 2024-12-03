import type React from 'react';

import Flexbox from '../elements/Flexbox';
import styles from './SideNav.module.css';

type Props = {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
};

export default function SideNav(props: Props) {
  return (
    <div className={styles.sideNav}>
      <Flexbox gap={8} align="center">
        <h4 className={styles.sideNavTitle}>{props.title}</h4>
        <div className={styles.sideNavActions}>{props.actions}</div>
      </Flexbox>
      <div className={styles.sideNavItems}>{props.children}</div>
    </div>
  );
}
