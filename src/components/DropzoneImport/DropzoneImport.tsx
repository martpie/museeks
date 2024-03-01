import cx from 'classnames';
// import { getCurrent } from '@tauri-apps/api/window';
import { useState } from 'react';

import styles from './DropzoneImport.module.css';

type Props = {
  // webview: Webview;
};

export default function DropzoneImport(props: Props) {
  const [isShown, setIsShown] = useState(false);

  // const unlisten = await getCurrent().onFileDropEvent((event) => {
  //   if (event.payload.type === 'hover') {
  //     console.log('test');
  //     setIsShown(true);
  //   } else if (event.payload.type === 'drop') {
  //     console.log('test1');
  //     alert('drop');
  //     setIsShown(false);
  //   } else {
  //     console.log('test2');
  //     setIsShown(false);
  //   }
  // });

  // useEffect(() => {
  //   return unlisten;
  // }, [unlisten]);

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
