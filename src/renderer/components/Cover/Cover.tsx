import { useEffect, useState } from 'react';
import * as AspectRatio from '@radix-ui/react-aspect-ratio';

import { Track } from '../../../shared/types/museeks';

import styles from './Cover.module.css';

type Props = {
  track: Track;
};

export default function Cover(props: Props) {
  const [coverPath, setCoverPath] = useState<string | null>(null);

  useEffect(() => {
    const refreshCover = async () => {
      const coverPath = await window.MuseeksAPI.covers.getCoverAsBase64(
        props.track,
      );
      setCoverPath(coverPath);
    };

    refreshCover();
  }, [props.track]);

  if (coverPath) {
    const encodedCoverPath = encodeURI(coverPath)
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"');

    return (
      <AspectRatio.Root ratio={1}>
        <img
          src={encodedCoverPath}
          alt="Album cover"
          className={styles.cover}
        />
      </AspectRatio.Root>
    );
  }

  return (
    <AspectRatio.Root ratio={1}>
      <div className={`${styles.cover} ${styles.empty}`}>
        {/** billion dollar problem: convert emoji to text, good luck 🎵 */}
        <div className={styles.cover__note}>♪</div>
      </div>
    </AspectRatio.Root>
  );
}
