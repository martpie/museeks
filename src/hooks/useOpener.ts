import { openUrl, revealItemInDir } from '@tauri-apps/plugin-opener';
import { useCallback } from 'react';

import { logAndNotifyError } from '../lib/utils';

export default function useOpener(
  href: string,
  type: 'filedir' | 'url',
): () => void {
  return useCallback(() => {
    switch (type) {
      case 'filedir':
        revealItemInDir(href).catch(logAndNotifyError);
        break;
      case 'url':
        openUrl(href).catch(logAndNotifyError);
        break;
    }
  }, [href, type]);
}
