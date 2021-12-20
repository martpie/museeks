import os from 'os';
import React, { useCallback, useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import KeyBinding from 'react-keybinding-component';
import { useHistory } from 'react-router';

import channels from '../shared/lib/ipc-channels';

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

/*
|--------------------------------------------------------------------------
| The App
|--------------------------------------------------------------------------
*/

enum DragState {
  IDLE = 'idle',
  DRAGGING = 'dragging',
  DRAGGED_OVER = 'draggedOver',
}

const Museeks: React.FC = (props) => {
  const history = useHistory();

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
            history.push('/settings');
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
    [history]
  );

  useEffect(() => {
    AppActions.init();
  }, []);

  // Various helpers for importing files from any view
  const [dragState, setDragState] = useState(DragState.IDLE);

  const onDragEnter = useCallback(() => {
    setDragState(DragState.DRAGGING);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragState(DragState.IDLE);
  }, []);

  const onDragOver = useCallback((e: React.SyntheticEvent<HTMLDivElement>) => {
    setDragState(DragState.DRAGGED_OVER);
    e.preventDefault();
  }, []);

  const onDrop: React.DragEventHandler<HTMLDivElement> = useCallback((e) => {
    setDragState(DragState.IDLE);

    const files = [];

    if (e.dataTransfer) {
      const eventFiles = e.dataTransfer.files;

      for (let i = 0; i < eventFiles.length; i++) {
        files.push(eventFiles[i].path);
      }

      LibraryActions.add(files).catch((err) => {
        console.warn(err);
      });
    }
  }, []);

  return (
    <div
      className={`${styles.root} os__${os.platform()}`}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <KeyBinding onKey={onKey} preventInputConflict />
      <Header />
      <main className={styles.mainContent}>{props.children}</main>
      <Footer />
      <Toasts />
      <DropzoneImport
        title='Add music to the library'
        subtitle='Drop files or folders anywhere'
        shown={dragState === DragState.DRAGGED_OVER}
      />
    </div>
  );
};

export default Museeks;
