import { getCurrentWindow } from '@tauri-apps/api/window';
import { lstat } from '@tauri-apps/plugin-fs';
import cx from 'classnames';
import { useEffect, useState } from 'react';

import useInvalidate from '../hooks/useInvalidate';
import { plural } from '../lib/localization';
import { logAndNotifyError } from '../lib/utils';
import { useLibraryAPI } from '../stores/useLibraryStore';
import { useToastsAPI } from '../stores/useToastsStore';
import styles from './DropzoneImport.module.css';

export default function DropzoneImport() {
  const libraryAPI = useLibraryAPI();
  const toastsAPI = useToastsAPI();

  const [isShown, setIsShown] = useState(false);
  const invalidate = useInvalidate();

  // Simplification welcome
  useEffect(() => {
    async function attachFileDropEvent() {
      const unlisten = getCurrentWindow()
        .onDragDropEvent(async (event) => {
          if (event.payload.type === 'over') {
            setIsShown(true);
          } else if (event.payload.type === 'drop') {
            setIsShown(false);

            // Syncudio does not deal in terms of files anymore, so we need to only retain folders.
            // Why? Because in case a user imports a specific file from within a folder, it should
            // ignore all other files, but it cannot do that as of today.
            const fileInfos = await Promise.all(
              event.payload.paths.map(async (path) => {
                return {
                  ...(await lstat(path)),
                  path,
                };
              }),
            );

            const folders = fileInfos
              .filter((fileOrFolder) => fileOrFolder.isDirectory)
              .map((folderInfo) => folderInfo.path);

            const skippedItemsCount =
              event.payload.paths.length - folders.length;

            if (skippedItemsCount !== 0) {
              toastsAPI.add(
                'warning',
                `${skippedItemsCount} non-folder ${plural('item', skippedItemsCount)} ignored`,
              );
            }

            if (folders.length > 0) {
              await libraryAPI.addLibraryFolders(folders);
              toastsAPI.add(
                'success',
                `${folders.length} ${plural('folder', folders.length)} added to the library`,
              );

              await libraryAPI.refresh();

              invalidate();
            }
          } else {
            setIsShown(false);
          }
        })
        .catch(logAndNotifyError);

      return unlisten;
    }

    const unlisten = attachFileDropEvent().catch(logAndNotifyError);

    return function cleanup() {
      unlisten.then((u) => (u ? u() : null));
    };
  }, [
    libraryAPI.addLibraryFolders,
    libraryAPI.refresh,
    toastsAPI.add,
    invalidate,
  ]);

  const classes = cx(styles.dropzone, {
    [styles.shown]: isShown,
  });

  return (
    <div className={classes}>
      <div className={styles.dropzoneTitle}>Add music to the library</div>
      <span>Drop folders anywhere</span>
    </div>
  );
}
