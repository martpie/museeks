import { openUrl, revealItemInDir } from '@tauri-apps/plugin-opener';
import { useCallback } from 'react';

export default function useOpener(
  href: string,
  type: 'filedir' | 'url',
): () => void {
  return useCallback(() => {
    switch (type) {
      case 'filedir':
        revealItemInDir(href);
        break;
      case 'url':
        openUrl(href);
        break;
    }
  }, [href, type]);
}
