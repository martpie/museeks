import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
import channels from '../../../shared/lib/ipc-channels';

import styles from './Cover.module.css';

interface Props {
  path: string;
}

const Cover: React.FC<Props> = (props) => {
  const [coverPath, setCoverPath] = useState<string | null>(null);

  useEffect(() => {
    const refreshCover = async () => {
      const coverPath = await ipcRenderer.invoke(channels.COVER_GET, props.path);
      setCoverPath(coverPath);
    };

    refreshCover();
  }, [props.path]);

  if (coverPath) {
    const encodedCoverPath = encodeURI(coverPath).replace(/'/g, "\\'").replace(/"/g, '\\"');
    const inlineStyles = { backgroundImage: `url('${encodedCoverPath}')` };

    return <div className={styles.cover} style={inlineStyles} />;
  }

  return (
    <div className={`${styles.cover} isEmpty`}>
      <div className={styles.cover__note}>♪</div>
    </div>
  );
};

export default Cover;
