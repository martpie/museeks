import { open } from '@tauri-apps/plugin-shell';
import type React from 'react';
import { useCallback } from 'react';

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
    <button type="button" className={styles.externalLink} onClick={openLink}>
      {props.children}
    </button>
  );
}
