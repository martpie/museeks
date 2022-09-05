import React, { useCallback, useEffect } from 'react';
import KeyBinding from 'react-keybinding-component';
import { useNavigate } from 'react-router';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Toasts from './components/Toasts/Toasts';

import AppActions from './store/actions/AppActions';
import * as LibraryActions from './store/actions/LibraryActions';
import * as PlayerActions from './store/actions/PlayerActions';

import styles from './App.module.css';
import { isCtrlKey } from './lib/utils-platform';
import Player from './lib/player';
import DropzoneImport from './components/DropzoneImport/DropzoneImport';
import { getPlatform } from './lib/utils-xplat';

/*
|--------------------------------------------------------------------------
| The App
|--------------------------------------------------------------------------
*/

type Props = {
  children: React.ReactNode;
};

const Museeks: React.FC<Props> = (props) => {
  const navigate = useNavigate();

  // App shortcuts (not using Electron's global shortcuts API to avoid conflicts
  // with other applications)
  const onKey = useCallback(
    async (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          e.stopPropagation();
          PlayerActions.playPause();
          break;
        case ',':
          if (isCtrlKey(e)) {
            e.preventDefault();
            e.stopPropagation();
            navigate('/settings');
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          e.stopPropagation();
          PlayerActions.jumpTo(Player.getCurrentTime() - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          e.stopPropagation();
          PlayerActions.jumpTo(Player.getCurrentTime() + 10);
          break;
        default:
          break;
      }
    },
    [navigate]
  );

  useEffect(() => {
    AppActions.init();
  }, []);

  // Drop behavior to add tracks to the library from any string
  const [{ isOver }, drop] = useDrop(() => {
    return {
      accept: [NativeTypes.FILE],
      drop(item: { files: Array<File> }) {
        const files = item.files.map((file) => file.path);

        LibraryActions.add(files)
          .then((_importedTracks) => {
            // TODO: Import to playlist here
          })
          .catch((err) => {
            console.warn(err);
          });
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    };
  });

  return (
    <div className={`${styles.root} os__${getPlatform()}`} ref={drop}>
      <KeyBinding onKey={onKey} preventInputConflict />
      <Header />
      <main className={styles.mainContent}>{props.children}</main>
      <Footer />
      <Toasts />
      <DropzoneImport title='Add music to the library' subtitle='Drop files or folders anywhere' shown={isOver} />
    </div>
  );
};

export default Museeks;
