import { useEffect, useState } from 'react';

import { Track } from '../../../shared/types/museeks';

import styles from './Cover.module.css';

interface Props {
  track: Track;
}

function Cover(props: Props) {
  const [coverPath, setCoverPath] = useState<string | null>(null);

  useEffect(() => {
    const refreshCover = async () => {
      const coverPath = await window.MuseeksAPI.covers.getCoverAsBase64(props.track);
      setCoverPath(coverPath);
    };

    refreshCover();
  }, [props.track]);

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
}

export default Cover;
