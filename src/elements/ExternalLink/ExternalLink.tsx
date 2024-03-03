import React, { useCallback } from 'react';
import { open } from '@tauri-apps/plugin-shell';

import styles from './ExternalLink.module.css';

type Props = {
  children: string;
  href: string;
};

export default function ExternalLink(props: Props) {
  const openLink = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      open(props.href);
    },
    [props.href],
  );

  return (
    <button className={styles.externalLink} role="link" onClick={openLink}>
      {props.children}
    </button>
  );
}
