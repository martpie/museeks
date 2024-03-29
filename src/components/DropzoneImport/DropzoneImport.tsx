import cx from 'classnames';
// import { getCurrent } from '@tauri-apps/api/window';
import { /** useEffect,*/ useState } from 'react';
// import { getCurrent } from '@tauri-apps/api/window';

// import { logAndNotifyError } from '../../lib/utils';

import styles from './DropzoneImport.module.css';

export default function DropzoneImport() {
  const [isShown, _setIsShown] = useState(false);

  // const unlisten = await getCurrent().onFileDropEvent((event) => {
  //   if (event.payload.type === 'hover') {
  //     console.log('User hovering', event.payload.paths);
  //   } else if (event.payload.type === 'drop') {
  //     console.log('User dropped', event.payload.paths);
  //   } else {
  //     console.log('File drop cancelled');
  //   }
  // });

  // useEffect(() => {
  //   async function attachFileDropEvent() {
  //     await getCurrent()
  //       .onFileDropEvent((event) => {
  //         if (event.payload.type === 'hover') {
  //           setIsShown(true);
  //         } else if (event.payload.type === 'drop') {
  //           console.log(event.payload.paths);
  //           setIsShown(false);
  //         } else {
  //           setIsShown(false);
  //         }
  //       })
  //       .catch(logAndNotifyError);
  //   }

  //   attachFileDropEvent().catch(logAndNotifyError);

  //   return getCurrent().clearEffects;
  // }, []);

  const classes = cx(styles.dropzone, {
    [styles.shown]: isShown,
  });

  // TODO: Fix this, drop files from TAURI instead
  // const files = item.files.map((file) => file.path);
  // libraryAPI
  //   .add(files)
  //   .then((/* _importedTracks */) => {
  //     // TODO: Import to playlist here
  //   })
  //   .catch((err) => {
  //     logger.warn(err);
  //   });
  return (
    <div className={classes}>
      <div className={styles.dropzone__title}>Add music to the library</div>
      <div className={styles.dropzone__subtitle}>
        Drop files or folders anywhere
      </div>
    </div>
  );
}
