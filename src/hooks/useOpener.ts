import { openUrl, revealItemInDir } from '@tauri-apps/plugin-opener';

import { logAndNotifyError } from '../lib/utils';

export default function useOpener(
  href: string,
  type: 'filedir' | 'url',
): () => void {
  return () => {
    switch (type) {
      case 'filedir':
        revealItemInDir(href).catch(logAndNotifyError);
        break;
      case 'url':
        openUrl(href).catch(logAndNotifyError);
        break;
    }
  };
}
