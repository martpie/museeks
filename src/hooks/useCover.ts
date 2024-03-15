import { useEffect, useState } from 'react';

import { Track } from '../generated/typings';
import library from '../lib/library';

/**
 * Given a track, get its associated cover as an Image src
 */
export default function useCover(track: Track): string | null {
  const [coverPath, setCoverPath] = useState<string | null>(null);

  useEffect(() => {
    const refreshCover = async () => {
      const cover = await library.getCover(track.path);
      setCoverPath(cover);
    };

    refreshCover();
  }, [track.path]);

  return coverPath;
}
