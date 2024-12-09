import { openPath, openUrl } from '@tauri-apps/plugin-opener';
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
      if (props.href.startsWith('http')) {
        openUrl(props.href);
      } else {
        openPath(props.href);
      }
    },
    [props.href],
  );

  return (
    <button type="button" className={styles.externalLink} onClick={openLink}>
      {props.children}
    </button>
  );
}
