import { useEffect, useState } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';

import { Track } from '../generated/typings';
import library from '../lib/library';

// TODO: cache the result here
export default function useCover(track: Track): string | null {
  const [coverPath, setCoverPath] = useState<string | null>(null);

  useEffect(() => {
    const refreshCover = async () => {
      const cover = await library.getCover(track.path);

      if (cover === null) {
        setCoverPath(null);
      } else {
        setCoverPath(cover.startsWith('data:') ? cover : convertFileSrc(cover));
      }
    };

    refreshCover();
  }, [track.path]);

  return coverPath;
}
