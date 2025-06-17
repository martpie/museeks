import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { lstat } from '@tauri-apps/plugin-fs';
import cx from 'classnames';
import { useEffect, useState } from 'react';

import useInvalidate from '../hooks/useInvalidate';
import { logAndNotifyError } from '../lib/utils';
import { useLibraryAPI } from '../stores/useLibraryStore';
import { useToastsAPI } from '../stores/useToastsStore';
import styles from './DropzoneImport.module.css';

export default function DropzoneImport() {
  const libraryAPI = useLibraryAPI();
  const toastsAPI = useToastsAPI();
  const { t } = useLingui();

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

            // Museeks does not deal in terms of files anymore, so we need to only retain folders.
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
              const message = plural(skippedItemsCount, {
                one: '# invalid item ignored',
                other: '# invalid items ignored',
              });

              toastsAPI.add('warning', message);
            }

            if (folders.length > 0) {
              await libraryAPI.addLibraryFolders(folders);

              const message = plural(folders.length, {
                one: '# folder added to the library',
                other: '# folders added to the library',
              });

              toastsAPI.add('success', message);

              await libraryAPI.scan();

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
    libraryAPI.scan,
    toastsAPI.add,
    invalidate,
  ]);

  const classes = cx(styles.dropzone, {
    [styles.shown]: isShown,
  });

  return (
    <div className={classes}>
      <div className={styles.dropzoneTitle}>{t`Add music to the library`}</div>
      <span>{t`Drop folders anywhere`}</span>
    </div>
  );
}
